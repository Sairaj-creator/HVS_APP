# app/services/patient_service.py
import logging
import datetime
from typing import Optional, List, Dict, Any # Ensure all needed types are imported

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
# Ensure String is imported for casting
from sqlalchemy import func, union_all, select, literal_column, String 

# Import project components
from app.models.patient import Patient
from app.models.encounter import Encounter
from app.models.note import ClinicalNote
from app.models.task import NurseTask
from app.schemas.patient import PatientCreate

# Configure logging
log = logging.getLogger(__name__)
# Ensure logging is configured (e.g., in main.py or here)
logging.basicConfig(level=logging.INFO)
# Consider setting level to DEBUG for more detailed history query logs
# logging.basicConfig(level=logging.DEBUG)


# --- Patient ID Generation ---
def generate_patient_id() -> str:
    """
    Generates a unique patient ID based on date and a simple sequence/time component.
    Format: YYYYMMDD-NNNN (e.g., 20251028-1516) - Using HHMM as placeholder sequence.
    """
    now = datetime.datetime.now()
    date_str = now.strftime("%Y%m%d")
    sequence_placeholder = now.strftime("%H%M") # Using HHMM

    patient_id = f"{date_str}-{sequence_placeholder}"
    log.debug(f"Generated potential Patient ID: {patient_id}")
    # TODO: Add DB check for collision and increment logic if needed for high volume.
    return patient_id

# --- Patient Retrieval Functions ---
def get_patient_by_id(db: Session, *, patient_id: str) -> Optional[Patient]:
    """Fetches a patient by their unique ID."""
    log.debug(f"Querying for patient with ID: {patient_id}")
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient:
        log.debug(f"Patient found for ID: {patient_id}")
    else:
        log.warning(f"Patient not found for ID: {patient_id}")
    return patient

def search_patients_by_name(db: Session, *, name_query: str, skip: int = 0, limit: int = 100) -> List[Patient]:
    """
    Searches for patients by full name (case-insensitive partial match).
    Includes basic pagination.
    """
    log.debug(f"Searching for patients with name containing: '{name_query}' (skip={skip}, limit={limit})")
    query_term = f"%{name_query}%"
    patients = (
        db.query(Patient)
        .filter(Patient.full_name.ilike(query_term))
        .order_by(Patient.full_name)
        .offset(skip)
        .limit(limit)
        .all()
    )
    log.info(f"Found {len(patients)} patients matching '{name_query}'.")
    return patients

# --- Patient Creation ---
def create_patient(db: Session, *, patient_in: PatientCreate) -> Optional[Patient]:
    """
    Registers a new patient in the database with a uniquely generated ID.
    """
    log.info(f"Attempting to register patient: {patient_in.full_name}")
    try:
        new_patient_id = generate_patient_id()
        existing_patient = get_patient_by_id(db, patient_id=new_patient_id)
        if existing_patient:
            log.error(f"Patient ID collision detected for ID: {new_patient_id}. Aborting creation.")
            return None

        db_patient = Patient(
            id=new_patient_id,
            full_name=patient_in.full_name,
            date_of_birth=patient_in.date_of_birth,
            contact_info=patient_in.contact_info,
        )
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        log.info(f"Successfully registered patient: {db_patient.full_name} (ID: {db_patient.id})")
        return db_patient
    except SQLAlchemyError as e:
        log.error(f"Database error during patient registration for {patient_in.full_name}: {e}", exc_info=True)
        db.rollback()
        return None
    except Exception as e:
        log.error(f"Unexpected error during patient registration for {patient_in.full_name}: {e}", exc_info=True)
        db.rollback()
        return None

# --- Patient History Retrieval ---
def get_patient_history(db: Session, *, patient_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves a unified historical timeline of all Encounters, Notes, and Tasks
    for a specific patient, ordered by creation time (newest first).
    """
    log.info(f"Querying full history for patient ID: {patient_id}")

    if not get_patient_by_id(db, patient_id=patient_id):
        log.warning(f"Cannot get history: Patient {patient_id} not found.")
        return []

    # 1. Select Encounters - CAST ENUMS TO STRING
    encounters_q = (
        select(
            literal_column("'ENCOUNTER'").label("type"),
            Encounter.id.label("id"),
            Encounter.created_at.label("timestamp"),
            Encounter.encounter_type.cast(String).label("subject"), # <-- CAST FIX
            Encounter.current_status.cast(String).label("detail")   # <-- CAST FIX
        )
        .where(Encounter.patient_id == patient_id)
    )
    log.debug(f"History Query (Encounters): {encounters_q}")

    # 2. Select Clinical Notes - CAST ENUM TO STRING
    notes_q = (
        select(
            literal_column("'NOTE'").label("type"),
            ClinicalNote.id.label("id"),
            ClinicalNote.created_at.label("timestamp"),
            ClinicalNote.note_type.cast(String).label("subject"), # <-- CAST FIX
            func.left(ClinicalNote.content, 100).label("detail") # Preview
        )
        .where(ClinicalNote.encounter_id.in_(
            select(Encounter.id).where(Encounter.patient_id == patient_id)
        ))
    )
    log.debug(f"History Query (Notes): {notes_q}")

    # 3. Select Nurse Tasks - CAST ENUM TO STRING
    tasks_q = (
        select(
            literal_column("'TASK'").label("type"),
            NurseTask.id.label("id"),
            NurseTask.created_at.label("timestamp"),
            func.left(NurseTask.description, 100).label("subject"), # Preview
            NurseTask.status.cast(String).label("detail") # <-- CAST FIX
        )
        .where(NurseTask.encounter_id.in_(
            select(Encounter.id).where(Encounter.patient_id == patient_id)
        ))
    )
    log.debug(f"History Query (Tasks): {tasks_q}")

    # Combine all results using UNION ALL and order by timestamp descending
    full_query = union_all(encounters_q, notes_q, tasks_q).order_by(literal_column("timestamp").desc())
    log.debug(f"History Query (Full Union): {full_query}")

    try:
        # Execute the query
        result = db.execute(full_query).mappings().all()
        log.debug(f"History query result (raw): {result}")

        # Convert ResultMapping objects to standard Python dictionaries
        history = [dict(row) for row in result]

        log.info(f"Found {len(history)} total history events for patient {patient_id}.")
        return history
    except SQLAlchemyError as e:
        log.error(f"Database error fetching history for patient {patient_id}: {e}", exc_info=True)
        return [] # Return empty list on error