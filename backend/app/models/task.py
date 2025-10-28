# app/models/task.py
import datetime
import enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    Column, Integer, String, DateTime, func, Enum as SQLEnum, ForeignKey, Text
)
from sqlalchemy.orm import relationship, Mapped

from app.db.base_class import Base

# For type hints without circular imports
if TYPE_CHECKING:
    from .user import User # noqa: F401
    from .encounter import Encounter # noqa: F401
    # from .note import ClinicalNote # noqa: F401 # If linking task to a note


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress" # Optional status
    COMPLETED = "completed"
    DELAYED = "delayed" # Task is overdue
    CANCELLED = "cancelled" # Task is no longer needed


class NurseTask(Base):
    """
    SQLAlchemy model representing a task assigned to a nurse for a patient encounter.
    Examples: Administer medication, check vitals, change dressing.
    """
    __tablename__ = "nurse_tasks"

    # --- Columns ---
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    description: Mapped[str] = Column(Text, nullable=False) # What needs to be done
    status: Mapped[TaskStatus] = Column(
        SQLEnum(TaskStatus), index=True, nullable=False, default=TaskStatus.PENDING
    )

    # Timestamps
    due_at: Mapped[datetime.datetime | None] = Column(DateTime(timezone=True), nullable=True, index=True) # When the task should be done by
    created_at: Mapped[datetime.datetime] = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[datetime.datetime | None] = Column(DateTime(timezone=True), nullable=True) # Timestamp when status becomes COMPLETED

    # --- Foreign Keys ---
    encounter_id: Mapped[int] = Column(Integer, ForeignKey("encounters.id"), nullable=False, index=True)
    assigned_nurse_id: Mapped[int | None] = Column(Integer, ForeignKey("users.id"), nullable=True, index=True) # Optional: Can be assigned later
    # originating_note_id: Mapped[int | None] = Column(Integer, ForeignKey("clinical_notes.id"), nullable=True) # Optional: Link task back to the note that triggered it

    # --- Relationships ---
    # Many-to-one: Many Tasks belong to one Encounter
    encounter: Mapped["Encounter"] = relationship("Encounter", back_populates="tasks")

    # Many-to-one: Many Tasks can be assigned to one User (Nurse)
    assigned_nurse: Mapped["User | None"] = relationship("User") # Assuming User doesn't need back_populates="assigned_tasks" yet

    # Optional: Many-to-one relationship back to the originating note
    # originating_note: Mapped["ClinicalNote | None"] = relationship("ClinicalNote")

    def __repr__(self) -> str:
        return f"<NurseTask(id={self.id}, encounter_id={self.encounter_id}, status='{self.status}')>"