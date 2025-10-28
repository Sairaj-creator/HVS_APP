# app/schemas/session.py
import asyncio
from typing import Optional

class SessionState:
    """Keeps track of transcription state for one session (handoff or dictation)."""
    def __init__(self, session_id: str):
        self.id = session_id
        self.audio_queue = asyncio.Queue()
        self.is_active = True
        self.final_transcript = "" # Store the complete transcript for saving

        # Context for saving note
        self.encounter_id: Optional[int] = None
        self.author_id: Optional[int] = None
        self.note_type: Optional[str] = None