# app/api/endpoints/handoff.py
import asyncio
import logging
from typing import Dict, Optional, Any

from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    Depends,
    Query,
    status
)
from sqlalchemy.orm import Session

# Project specific imports
from app.db.session import get_db
from app.api import deps # Contains verify_token, user_service access
from app.models.user import User
from app.services import asr_service # Handles the ASR processing
from app.utils.connection_manager import ConnectionManager
from app.schemas.session import SessionState # <-- Import SessionState from new location

# --- Logging Setup ---
log = logging.getLogger(__name__)
# Ensure logging is configured globally (e.g., in main.py) or configure here
# logging.basicConfig(level=logging.INFO)

# --- Connection Management ---
manager = ConnectionManager()
# Store active session states globally (consider a more robust state management for production)
active_session_states: Dict[str, SessionState] = {}

# --- WebSocket Authentication Dependency ---
async def get_current_user_ws(
    websocket: WebSocket,
    token: str = Query(..., description="JWT Access Token passed as query parameter"),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to authenticate WebSocket connections via a query parameter token.
    Closes the connection if authentication fails.
    """
    # Verify the token structure and signature
    username = deps.verify_token(token)
    if not username:
        log.warning("WebSocket authentication failed: Invalid or missing token.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication Required")
        raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication Required")

    # Fetch the user from the database
    # Ensure user_service is accessible via deps or imported directly if needed
    user = deps.user_service.get_user_by_username(db, username=username)
    if not user:
        log.warning(f"WebSocket authentication failed: User '{username}' not found.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")
        raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")

    log.info(f"WebSocket authenticated for user: {user.username}")
    return user

# --- API Router Definition ---
router = APIRouter()

# --- WebSocket Endpoint for Dictation ---
@router.websocket("/ws/dictation/{session_id}")
async def websocket_dictation_endpoint(
    websocket: WebSocket,
    session_id: str,
    encounter_id: int = Query(..., description="The ID of the encounter for this dictation"),
    current_user: User = Depends(get_current_user_ws) # Use the WS-specific auth dependency
):
    """
    WebSocket endpoint for real-time clinical dictation.

    Requires authentication via 'token' query parameter.
    Requires 'encounter_id' query parameter.

    Streams audio to ASR, sends back live transcript, and saves the final note
    via the ASR service.

    URL Example: ws://host:port/ws/dictation/some_session_id?encounter_id=123&token=YOUR_JWT_TOKEN
    """
    state: Optional[SessionState] = None # Initialize for reliable cleanup
    try:
        # 1. Accept Connection & Initialize Session State
        await manager.connect(session_id, websocket)
        state = SessionState(session_id)
        state.encounter_id = encounter_id
        state.author_id = current_user.id
        state.note_type = "doctor_dictation" # Set note type for this specific endpoint
        active_session_states[session_id] = state

        await manager.send_json(session_id, {"status": "connected", "message": f"Starting dictation for encounter {encounter_id}..."})
        log.info(f"Dictation WS connected: session {session_id}, encounter {encounter_id}, user {current_user.id}")

        # 2. Define Concurrent Tasks

        # Task A: Receives audio chunks from the App and puts them in the queue
        async def receive_audio_task():
            log.info(f"[{session_id}] Starting audio receive task.")
            while state and state.is_active:
                try:
                    audio_chunk = await websocket.receive_bytes()
                    if state and state.audio_queue:
                         await state.audio_queue.put(audio_chunk)
                         log.debug(f"[{session_id}] Received {len(audio_chunk)} audio bytes.")
                    else:
                         log.warning(f"[{session_id}] State or queue missing in receive task, stopping.")
                         break
                except WebSocketDisconnect:
                    log.warning(f"[{session_id}] Receive task: WebSocket disconnected by client.")
                    break # Exit loop cleanly on disconnect
                except Exception as e:
                    log.error(f"[{session_id}] Receive task error: {e}", exc_info=True)
                    break # Exit loop on other errors
            # Signal end of stream to processing task by putting None in queue
            if state and state.audio_queue:
                await state.audio_queue.put(None)
            log.info(f"[{session_id}] Audio receive task finished.")

        # Task B: Processes audio queue via ASR service and handles saving
        # This function must exist in app/services/asr_service.py
        processing_task = asr_service.process_dictation_and_save_note(websocket, state)

        # 3. Run Receive and Process Tasks Concurrently
        log.info(f"[{session_id}] Starting concurrent receive and process tasks.")
        # `gather` waits for both tasks to complete or for one to raise an exception
        await asyncio.gather(receive_audio_task(), processing_task)
        log.info(f"[{session_id}] Concurrent tasks finished.")

    except WebSocketDisconnect as e:
        # Handle disconnections raised by auth or during operation
        log.warning(f"WebSocket client {session_id} disconnected: Code {e.code}, Reason: {e.reason}")

    except Exception as e:
        # Catch unexpected errors during setup or task running
        log.error(f"Unhandled error in dictation session {session_id}: {e}", exc_info=True)
        # Attempt to inform client before closing (may fail if connection is already lost)
        try:
            # Check connection state before sending
            if websocket.client_state == status.WS_STATE_CONNECTED:
                 await manager.send_json(session_id, {"status": "fatal_error", "message": f"Server error: {type(e).__name__}"})
        except Exception:
            pass # Ignore errors during error reporting on a potentially closed socket

    finally:
        # --- Final Cleanup Logic ---
        log.info(f"Cleaning up dictation WS session {session_id}.")
        # Ensure state flags are set correctly to signal other tasks
        if state:
            state.is_active = False
            # Try to put None in queue if it wasn't already to help generator exit gracefully
            if state.audio_queue:
                try:
                    state.audio_queue.put_nowait(None)
                except asyncio.QueueFull:
                    pass # Queue might be full if already signaled

        # Disconnect manager and remove state reference
        manager.disconnect(session_id)
        if session_id in active_session_states:
            del active_session_states[session_id]

        # Explicitly close websocket if needed (usually handled by context manager/disconnect exception)
        # try:
        #     if websocket.client_state == status.WS_STATE_CONNECTED:
        #         await websocket.close(code=status.WS_1001_GOING_AWAY)
        # except Exception:
        #     pass # Ignore errors during final close

        log.info(f"Dictation WS session {session_id} cleanup complete.")