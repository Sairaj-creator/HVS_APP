# app/api/endpoints/tasks.py
import logging
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

# Import project components
from app.api import deps
from app.db.session import get_db
from app.models.user import User, UserRole # Import UserRole if needed for deps
from app.models.task import TaskStatus # Import TaskStatus enum
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate # Import all task schemas
from app.services import task_service # Import the task service

log = logging.getLogger(__name__)

# --- API Router Initialization ---
router = APIRouter()
# ---------------------------------

# --- ENDPOINT 1: CREATE NEW TASK ---
@router.post(
    "/", # Corresponds to POST /api/v1/tasks/
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(deps.get_current_user)], # Requires authentication
    summary="Create New Task",
    description="Creates a new task associated with an encounter."
)
def create_new_task(
    *,
    db: Session = Depends(get_db),
    task_in: TaskCreate, # Validate request body against TaskCreate schema
    current_user: User = Depends(deps.get_current_user) # Get user for logging/auditing
) -> Any:
    """
    Create a new nurse task. Requires authentication.
    """
    log.info(f"User {current_user.id} attempting to create task for encounter: {task_in.encounter_id}")

    # Call the service function to create the task
    task = task_service.create_task(db=db, task_in=task_in)

    # Handle potential creation failures
    if task is None:
        log.error(f"Failed to create task for encounter: {task_in.encounter_id}. Service returned None.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, # Or 404 if encounter/nurse not found
            detail="Could not create task. Check if encounter and assigned nurse exist.",
        )

    log.info(f"Successfully created task ID: {task.id} for encounter {task.encounter_id}")
    return task

# --- ENDPOINT 2: GET TASKS FOR ENCOUNTER ---
@router.get(
    "/encounter/{encounter_id}",
    response_model=List[TaskRead],
    dependencies=[Depends(deps.get_current_user)],
    summary="Get Tasks by Encounter ID"
)
def get_tasks_for_encounter_endpoint(
    *,
    db: Session = Depends(get_db),
    encounter_id: int,
    status_filter: Optional[TaskStatus] = Query(None, description="Filter tasks by status"),
) -> Any:
    """Retrieve all tasks for a specific patient encounter."""
    tasks = task_service.get_tasks_for_encounter(
        db=db,
        encounter_id=encounter_id,
        status_filter=status_filter
    )
    return tasks

# --- ENDPOINT 3: GET MY PENDING TASKS ---
@router.get(
    "/me",
    response_model=List[TaskRead],
    dependencies=[Depends(deps.get_current_user)],
    summary="Get My Pending Tasks (Nurse Dashboard)"
)
def get_my_pending_tasks_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Retrieves the current authenticated user's pending tasks."""
    if current_user.role not in [UserRole.NURSE, UserRole.ADMIN]: # Use Enum
        log.warning(f"User {current_user.username} tried to access dashboard tasks but role is {current_user.role}.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Nurses/Admins can retrieve their tasks via this endpoint.",
        )
    tasks = task_service.get_tasks_for_nurse(
        db=db,
        nurse_id=current_user.id,
        status_filter=TaskStatus.PENDING
    )
    return tasks

# --- ENDPOINT 4: MARK TASK AS COMPLETE ---
@router.patch(
    "/{task_id}/complete",
    response_model=TaskRead,
    dependencies=[Depends(deps.get_current_user)],
    summary="Mark Task as Completed"
)
def complete_task_endpoint(
    *,
    db: Session = Depends(get_db),
    task_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Marks a nurse task as completed."""
    if current_user.role not in [UserRole.NURSE, UserRole.DOCTOR, UserRole.ADMIN]: # Use Enum
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clinical staff or admins can mark tasks as complete.",
        )
    updated_task = task_service.complete_task(
        db=db,
        task_id=task_id,
        completing_nurse_id=current_user.id
    )
    if updated_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found or already completed.", # Added clarity
        )
    return updated_task

# --- (Add other task endpoints like updating status, assigning nurse later if needed) ---