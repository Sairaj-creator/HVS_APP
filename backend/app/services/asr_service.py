# app/services/asr_service.py
import asyncio
import logging
from typing import AsyncGenerator

from fastapi import WebSocket # Import WebSocket for type hint
from google.cloud import speech
from google.api_core.exceptions import DeadlineExceeded, Cancelled

# Import project components
from app.schemas.session import SessionState # Assuming SessionState is there
from app.utils.connection_manager import manager # Assuming manager is imported/defined
from app.db.session import SessionLocal # Import SessionLocal to create a DB session
from app.services import note_service # Import the new note service

# --- ASR Configuration ---
ASR_RATE_HZ = 16000
ASR_LANGUAGE_CODE = "en-US"

log = logging.getLogger(__name__)

def get_asr_config() -> speech.RecognitionConfig:
    # ... (Keep existing get_asr_config function) ...
    return speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=ASR_RATE_HZ,
        language_code=ASR_LANGUAGE_CODE,
        enable_automatic_punctuation=True,
        diarization_config=speech.SpeakerDiarizationConfig( # Keep diarization if needed
            enable_speaker_diarization=True, min_speaker_count=1, max_speaker_count=2,
        ),
    )

async def audio_stream_generator(state: SessionState) -> AsyncGenerator[speech.StreamingRecognizeRequest, None]:
    # ... (Keep existing audio_stream_generator function) ...
    log.info(f"[{state.id}] Starting audio stream generator...")
    yield speech.StreamingRecognizeRequest(streaming_config=speech.StreamingRecognitionConfig(
        config=get_asr_config(), interim_results=True, single_utterance=False
    ))
    while state.is_active:
        try:
            chunk = await asyncio.wait_for(state.audio_queue.get(), timeout=5.0)
            if chunk is None: break
            yield speech.StreamingRecognizeRequest(audio_content=chunk)
        except asyncio.TimeoutError:
            if not state.is_active: break
            continue
        except Exception as e:
            log.error(f"[{state.id}] Audio generator error: {e}")
            break
    log.info(f"[{state.id}] Audio stream generator finished.")


# --- RENAMED & MODIFIED: Main Processing Function ---
async def process_dictation_and_save_note(websocket: WebSocket, state: SessionState):
    """
    Handles ASR streaming, sends feedback, accumulates transcript,
    and saves the final note to the database.
    """
    db: Session | None = None # Initialize db session variable
    try:
        # Initialize Google Speech Client
        client = speech.SpeechAsyncClient()
        log.info(f"[{state.id}] Google Speech Client initialized for dictation.")

        requests = audio_stream_generator(state)
        log.info(f"[{state.id}] Audio stream generator created.")

        # Start streaming recognition
        responses: AsyncGenerator[speech.StreamingRecognizeResponse, None] = await client.streaming_recognize(
            requests=requests,
            timeout=300 # 5-minute inactivity timeout
        )
        log.info(f"[{state.id}] Google streaming_recognize called, awaiting responses...")

        # Process responses asynchronously
        async for response in responses:
            if not state.is_active or state.id not in manager.active_connections:
                log.warning(f"[{state.id}] WebSocket closed during ASR, stopping processing.")
                break # Stop processing if client disconnected

            if not response.results: continue
            result = response.results[0]
            if not result.alternatives: continue

            transcript_fragment = result.alternatives[0].transcript
            is_final = result.is_final

            # 1. Send Transcript Update Back to App
            await manager.send_json(state.id, {
                "type": "transcript_update",
                "text": transcript_fragment,
                "is_final": is_final,
            })
            log.debug(f"[{state.id}] Sent transcript fragment: '{transcript_fragment}' (Final: {is_final})")

            # 2. Accumulate Final Transcript
            if is_final:
                state.final_transcript += transcript_fragment.strip() + " " # Add space between final segments

        # --- AFTER ASR STREAM FINISHES ---
        log.info(f"[{state.id}] ASR stream processing finished. Final accumulated transcript length: {len(state.final_transcript)}")

        # 3. Save Final Note to Database
        if state.final_transcript and state.encounter_id and state.author_id and state.note_type:
            log.info(f"[{state.id}] Attempting to save final note to database...")
            # Create a NEW database session specifically for this save operation
            db = SessionLocal()
            saved_note = await asyncio.to_thread( # Run synchronous DB operation in thread pool
                note_service.create_note,
                db=db,
                encounter_id=state.encounter_id,
                author_id=state.author_id,
                note_type=state.note_type,
                content=state.final_transcript.strip() # Remove trailing space
            )
            if saved_note:
                await manager.send_json(state.id, {"status": "note_saved", "note_id": saved_note.id})
                log.info(f"[{state.id}] Note saved successfully (ID: {saved_note.id}).")
            else:
                await manager.send_json(state.id, {"status": "error", "message": "Failed to save clinical note."})
                log.error(f"[{state.id}] Failed to save clinical note via note_service.")
        else:
            log.warning(f"[{state.id}] Skipping note save: Missing required context (encounter_id, author_id, note_type) or empty transcript.")
            await manager.send_json(state.id, {"status": "warning", "message": "Note not saved (missing context or empty transcript)."})


    except DeadlineExceeded:
        log.warning(f"[{state.id}] ASR stream timeout.")
        await manager.send_json(state.id, {"status": "timeout", "message": "ASR stream timed out."})
    except Cancelled:
        log.info(f"[{state.id}] ASR stream cancelled (expected on disconnect/end).")
    except Exception as e:
        log.error(f"[{state.id}] CRITICAL ASR Service Error: {e}", exc_info=True)
        await manager.send_json(state.id, {"status": "asr_error", "message": f"ASR processing failed: {type(e).__name__}"})
    finally:
        state.is_active = False # Ensure generator stops
        if db: # Close the specific DB session we opened
            db.close()
        log.info(f"[{state.id}] process_dictation_and_save_note finished.")