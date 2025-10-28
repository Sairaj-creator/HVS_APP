# app/api/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any

from app.db.session import get_db
from app.schemas.user import UserCreate, UserRead
from app.schemas.token import Token
from app.services import user_service # We'll create user_service next
from app.core.security import create_access_token, verify_password
import logging

# Create an API router
router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate
) -> Any:
    """
    Register a new user (Doctor or Nurse).
    """
    logging.info(f"Attempting registration for username: {user_in.username}")
    # Check if user already exists
    user = user_service.get_user_by_username(db, username=user_in.username)
    if user:
        logging.warning(f"Registration failed: Username '{user_in.username}' already exists.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered.",
        )
    # Create the user
    new_user = user_service.create_user(db=db, user_in=user_in)
    logging.info(f"Successfully registered user: {new_user.username}")
    return new_user

@router.post("/login/token", response_model=Token)
def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends() # Uses form data (username, password)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    logging.info(f"Login attempt for username: {form_data.username}")
    # Authenticate the user
    user = user_service.authenticate_user(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        logging.warning(f"Login failed: Invalid credentials for username '{form_data.username}'.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Create and return the access token
    access_token = create_access_token(subject=user.username) # Use username as JWT subject
    logging.info(f"Login successful for user: {user.username}")
    return {"access_token": access_token, "token_type": "bearer"}