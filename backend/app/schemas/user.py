# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
# Assuming UserRole enum is correctly defined in app.models.user
from app.models.user import UserRole

# --- Base Schema ---
class UserBase(BaseModel):
    username: EmailStr # Use email as username
    full_name: Optional[str] = None
    role: UserRole

# --- Schema for Creating a User (receives password) ---
class UserCreate(UserBase):
    password: str

# --- Schema for Reading User Data (never includes password) ---
class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True # Allows creating schema from ORM model

# --- Schema for Updating User ---
class UserUpdate(BaseModel):
    # --- ADD INDENTED FIELDS HERE ---
    username: Optional[EmailStr] = None # Example: Allow updating username
    full_name: Optional[str] = None    # Example: Allow updating full name
    password: Optional[str] = None       # Example: Allow updating password (optional)
    role: Optional[UserRole] = None      # Example: Allow updating role (optional)
    # If you truly want it empty for now (unlikely), use 'pass':
    # pass