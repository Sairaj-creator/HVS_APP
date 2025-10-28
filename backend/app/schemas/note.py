# app/schemas/note.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.note import NoteType # Import enum

# --- Schema for creating (used internally by service) ---
# Not strictly needed for API input if notes only come from dictation
# class NoteCreate(BaseModel):
#     encounter_id: int
#     author_id: int
#     note_type: NoteType
#     content: str

# --- Schema for reading note data ---
class NoteRead(BaseModel):
    id: int
    encounter_id: int
    author_id: int
    note_type: NoteType
    content: str
    created_at: datetime
    # Optionally include author details if needed later
    # author_name: Optional[str] = None

    class Config:
        from_attributes = True # Enable ORM mode