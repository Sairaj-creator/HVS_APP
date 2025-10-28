# app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Generator, Optional # Generator might not be needed unless using yield db differently
import logging

# Import necessary components
from app.db.session import get_db
from app.core.security import verify_token
from app.models.user import User
from app.services import user_service # Import the service to fetch user

# --- OAuth2 Scheme ---
# This tells FastAPI how to find the token (in the Authorization header)
# and which URL the client should use to *get* the token (your login endpoint)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/token") # Adjust URL if your router has a prefix

# --- Dependency Function ---
def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    FastAPI dependency to verify the JWT token and return the authenticated user.

    Raises:
        HTTPException(401): If the token is invalid, expired, or the user doesn't exist.

    Returns:
        The authenticated User database object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Verify the token structure and signature
    username = verify_token(token)
    if username is None:
        logging.warning("Token verification failed (invalid token or missing subject).")
        raise credentials_exception

    # 2. Fetch the user from the database using the username from the token
    user = user_service.get_user_by_username(db, username=username)
    if user is None:
        logging.warning(f"Token valid, but user '{username}' not found in DB.")
        raise credentials_exception

    # 3. Return the authenticated user object
    logging.debug(f"Authenticated user retrieved: {user.username}")
    return user

# --- Optional Role-Based Dependency ---
# Example: Create a dependency that ensures the user is a Doctor
# def get_current_doctor_user(
#     current_user: User = Depends(get_current_user)
# ) -> User:
#     """Dependency requiring the user to have the 'doctor' role."""
#     if current_user.role != "doctor":
#         logging.warning(f"Access denied: User '{current_user.username}' is not a doctor.")
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Operation not permitted for this user role",
#         )
#     return current_user