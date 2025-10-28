# app/schemas/task.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Import Enum defined in the model
from app.models.task import TaskStatus

# --- Base Schema (Common fields) ---
class TaskBase(BaseModel):
    description: str
    encounter_id: int # Link to the encounter
    due_at: Optional[datetime] = None # Optional due time
    assigned_nurse_id: Optional[int] = None # Optional assignment

# --- Schema for Creating a Task ---
class TaskCreate(TaskBase):
    # May add originating_note_id later if needed
    pass # Status defaults to PENDING in the model

# --- Schema for Updating a Task ---
class TaskUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[TaskStatus] = None # Allow updating status
    due_at: Optional[datetime] = None
    assigned_nurse_id: Optional[int] = None
    # completed_at is set automatically by service logic

# --- Schema for Reading Task Data ---
class TaskRead(TaskBase):
    id: int
    status: TaskStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    # Optionally include assigned_nurse details later

    class Config:
        from_attributes = True # Enable ORM mode