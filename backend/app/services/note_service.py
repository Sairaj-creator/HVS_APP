# app/services/note_service.py
import logging
from typing import Optional, List # Ensure List is imported if needed elsewhere
from sqlalchemy.orm import Session # <-- ADD THIS IMPORT
from sqlalchemy.exc import SQLAlchemyError
from app.models.note import ClinicalNote, NoteType
from app.models.encounter import Encounter
# ...

log = logging.getLogger(__name__)

# --- (Existing create_note function remains here) ---
def create_note(
    db: Session,
    *,
    encounter_id: int,
    author_id: int,
    note_type: NoteType,
    content: str
) -> Optional[ClinicalNote]:
    # ... (existing code) ...
    log.info(f"Attempting to save note for encounter {encounter_id} by author {author_id}")
    encounter = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not encounter:
        log.error(f"Cannot save note: Encounter {encounter_id} not found.")
        return None
    author = db.query(User).filter(User.id == author_id).first()
    if not author:
         log.error(f"Cannot save note: Author {author_id} not found.")
         return None
    if not content or not content.strip():
        log.warning(f"Attempted to save empty note for encounter {encounter_id}.")
        return None

    try:
        db_note = ClinicalNote(
            encounter_id=encounter_id,
            author_id=author_id,
            note_type=note_type,
            content=content.strip()
        )
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        log.info(f"Successfully saved note ID: {db_note.id} for encounter {encounter_id}")
        return db_note
    except SQLAlchemyError as e:
        log.error(f"Database error saving note for encounter {encounter_id}: {e}", exc_info=True)
        db.rollback()
        return None
    except Exception as e:
        log.error(f"Unexpected error saving note for encounter {encounter_id}: {e}", exc_info=True)
        db.rollback()
        return None

# --- NEW: Function to get notes for an encounter ---
def get_notes_for_encounter(db: Session, *, encounter_id: int) -> List[ClinicalNote]:
    """
    Retrieves all clinical notes associated with a specific encounter,
    ordered by creation time (newest first).
    """
    log.debug(f"Querying for notes associated with encounter ID: {encounter_id}")
    # Optional: Add validation to check if encounter_id exists first
    notes = (
        db.query(ClinicalNote)
        .filter(ClinicalNote.encounter_id == encounter_id)
        .order_by(ClinicalNote.created_at.desc()) # Show newest notes first
        .all()
    )
    log.info(f"Found {len(notes)} notes for encounter ID: {encounter_id}")
    return notes