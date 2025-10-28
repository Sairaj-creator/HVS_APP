# app/db/base.py
# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base
from app.models.user import User
from app.models.patient import Patient
from app.models.encounter import Encounter # <-- Add this line
from app.models.note import ClinicalNote # <-- Add this line
from app.models.task import NurseTask
# from app.models.task import NurseTask # Add later
# from app.models.note import ClinicalNote # Add later
# from app.models.task import NurseTask # Add later