# app/api/endpoints/encounters.py
import logging
from typing import Any, List, Optional, Dict # Include all necessary types
from datetime import datetime # Include datetime for schema use

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field # Include BaseModel here
from app.models.encounter import LabReportStatus, EncounterStatus # Import Enums

# Import project components
from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.schemas.encounter import EncounterCreate, EncounterRead, EncounterUpdate
from app.schemas.note import NoteRead
from app.services import encounter_service, note_service # Import both services

log = logging.getLogger(__name__)

# --- Pydantic Schema for Lab Status Update (Defined locally in the router file) ---
# NOTE: This must be defined BEFORE being used in the endpoint
class LabStatusUpdate(BaseModel):
    new_status: LabReportStatus
    expected_at: Optional[datetime] = None

# --- Pydantic Schema for Alarm Response (Defined locally in the router file) ---
class CriticalAlerts(BaseModel):
    """Schema to unify all critical alerts for the Dashboard."""
    medication_overdue: List[EncounterRead]
    lab_reports_delayed: List[EncounterRead]

    class Config:
        # Allow ORM mode for the nested EncounterRead lists
        from_attributes = True

# --- API Router Initialization ---
router = APIRouter()
# ---------------------------------

# --- ENDPOINT 1: CREATE NEW ENCOUNTER (POST /) ---
@router.post(
    "/",
    response_model=EncounterRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(deps.get_current_user)]
)
def create_new_encounter(
    *,
    db: Session = Depends(get_db),
    encounter_in: EncounterCreate,
) -> Any:
    """Create an initial encounter record (e.g., during triage)."""
    log.info(f"Received request to create encounter for patient: {encounter_in.patient_id}")
    encounter = encounter_service.create_initial_encounter(db=db, encounter_in=encounter_in)
    if encounter is None:
        log.error(f"Failed to create encounter for patient: {encounter_in.patient_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found or encounter could not be created.",
        )
    log.info(f"Successfully created encounter ID: {encounter.id}")
    return encounter

# --- ENDPOINT 2: RETRIEVE ENCOUNTER DETAILS (GET /{id}) ---
@router.get(
    "/{encounter_id}",
    response_model=EncounterRead,
    dependencies=[Depends(deps.get_current_user)]
)
def get_encounter_details(
    *,
    db: Session = Depends(get_db),
    encounter_id: int,
) -> Any:
    """Retrieve details for a specific encounter by its ID."""
    log.info(f"Request received to fetch details for encounter ID: {encounter_id}")
    encounter = encounter_service.get_encounter_by_id(db=db, encounter_id=encounter_id)
    if encounter is None:
        log.warning(f"Encounter with ID '{encounter_id}' not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found",
        )
    return encounter

# --- ENDPOINT 3: UPDATE ENCOUNTER (PATCH /{id}) ---
@router.patch(
    "/{encounter_id}",
    response_model=EncounterRead,
    dependencies=[Depends(deps.get_current_user)]
)
def update_existing_encounter(
    *,
    db: Session = Depends(get_db),
    encounter_id: int,
    encounter_in: EncounterUpdate,
) -> Any:
    """Update an existing encounter (e.g., admit, discharge)."""
    log.info(f"Received request to update encounter ID: {encounter_id}")
    if not encounter_service.get_encounter_by_id(db=db, encounter_id=encounter_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Encounter not found")

    updated_encounter = encounter_service.update_encounter(
        db=db, encounter_id=encounter_id, encounter_update=encounter_in
    )
    if updated_encounter is None:
        log.error(f"Failed to update encounter ID: {encounter_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update encounter due to an internal error.",
        )
    return updated_encounter

# --- ENDPOINT 4: GET NOTES FOR ENCOUNTER (GET /{id}/notes) ---
@router.get(
    "/{encounter_id}/notes",
    response_model=List[NoteRead],
    dependencies=[Depends(deps.get_current_user)]
)
def get_encounter_notes(
    *,
    db: Session = Depends(get_db),
    encounter_id: int,
) -> Any:
    """Retrieve all clinical notes for a specific encounter ID."""
    log.info(f"Request received to fetch notes for encounter ID: {encounter_id}")
    encounter = encounter_service.get_encounter_by_id(db=db, encounter_id=encounter_id)
    if not encounter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Encounter not found")

    notes = note_service.get_notes_for_encounter(db=db, encounter_id=encounter_id)
    log.info(f"Returning {len(notes)} notes for encounter ID: {encounter_id}")
    return notes

# --- ENDPOINT 5: UPDATE LAB STATUS (PATCH /{id}/lab-status) ---
@router.patch(
    "/{encounter_id}/lab-status",
    response_model=EncounterRead,
    dependencies=[Depends(deps.get_current_user)],
    summary="Update Lab Report Status",
)
def update_encounter_lab_status(
    *,
    db: Session = Depends(get_db),
    encounter_id: int,
    lab_status_in: LabStatusUpdate, # Uses the locally defined schema
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Updates the lab status (e.g., ORDERED, RECEIVED, DELAYED) for an encounter."""
    log.info(f"Request to update lab status for encounter {encounter_id} to {lab_status_in.new_status}")
    if not encounter_service.get_encounter_by_id(db=db, encounter_id=encounter_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Encounter not found")

    updated_encounter = encounter_service.update_lab_status(
        db=db, 
        encounter_id=encounter_id,
        new_status=lab_status_in.new_status,
        expected_at=lab_status_in.expected_at
    )
    if updated_encounter is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update lab status.")

    return updated_encounter

# --- ENDPOINT 6: GET CRITICAL ALERTS (GET /alerts/critical) ---
@router.get(
    "/alerts/critical",
    response_model=CriticalAlerts, # Uses the locally defined schema
    dependencies=[Depends(deps.get_current_user)],
    summary="Get Critical Medication and Lab Alerts for Dashboard",
    description="Retrieves a list of encounters with overdue medications or delayed lab reports."
)
def get_critical_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
) -> CriticalAlerts:
    """
    Retrieves critical, time-sensitive alerts for the current shift dashboard.
    """
    log.info(f"User {current_user.id} fetching critical alerts.")

    # Call service functions (Ensure these services are implemented in encounter_service.py)
    med_alerts = encounter_service.get_medication_alerts(db)
    lab_alerts = encounter_service.get_delayed_lab_alerts(db)

    # Return data wrapped in the CriticalAlerts schema
    return CriticalAlerts(
        medication_overdue=med_alerts,
        lab_reports_delayed=lab_alerts
    )