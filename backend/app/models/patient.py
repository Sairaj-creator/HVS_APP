# app/models/patient.py
import datetime
# --- Add TYPE_CHECKING and Encounter import ---
from typing import List, TYPE_CHECKING

from sqlalchemy import Column, String, Date, DateTime, func
from sqlalchemy.orm import relationship, Mapped

from app.db.base_class import Base

# --- Add TYPE_CHECKING block ---
if TYPE_CHECKING:
    from .encounter import Encounter # noqa: F401
# --- End TYPE_CHECKING block ---


class Patient(Base):
    """SQLAlchemy model representing a patient registered in the system."""
    __tablename__ = "patients"

    # --- Columns (remain the same) ---
    id: Mapped[str] = Column(String, primary_key=True, index=True)
    full_name: Mapped[str] = Column(String, index=True, nullable=False)
    date_of_birth: Mapped[datetime.date | None] = Column(Date, nullable=True)
    contact_info: Mapped[str | None] = Column(String, nullable=True)
    registration_timestamp: Mapped[datetime.datetime] = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_at: Mapped[datetime.datetime] = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime | None] = Column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # --- Relationships ---
    # Ensure this relationship is uncommented and uses Mapped
    encounters: Mapped[List["Encounter"]] = relationship(
        "Encounter",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Patient(id='{self.id}', name='{self.full_name}')>"