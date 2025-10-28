# app/api/endpoints/admin.py
import logging
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query # Added Query
from sqlalchemy.orm import Session

# Import project components
from app.api import deps # Contains dependencies like get_db, require_admin_role
from app.db.session import get_db
from app.models.user import User # Needed for type hint
from app.schemas.user import UserCreate, UserRead # Import UserRead for response
from app.services import user_service # Import the user service

log = logging.getLogger(__name__)

# Assume 'router = APIRouter()' is defined earlier in this file

# --- (Existing create_user_by_admin endpoint would be here) ---

@router.get(
    "/users", # Corresponds to GET /api/v1/admin/users
    response_model=List[UserRead], # Specify response structure
    dependencies=[Depends(deps.require_admin_role)], # Protect with Admin role check
    summary="List Non-Admin Users",
    description="Admin endpoint to retrieve a paginated list of all Doctor and Nurse users."
)
def list_users(
    *,
    db: Session = Depends(get_db),
    # Add validation for pagination parameters using Query
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=200, description="Maximum number of records to return (max 200)"),
    # current_admin: User = Depends(deps.require_admin_role) # Already checked by dependency
) -> Any:
    """
    Admin endpoint to retrieve a list of all Doctor and Nurse users with pagination.
    """
    log.info(f"Admin request received to list users (skip={skip}, limit={limit}).")
    users = user_service.get_all_users(db=db, skip=skip, limit=limit)
    log.info(f"Returning {len(users)} users to admin.")
    # FastAPI automatically converts the List[User] from the service
    # into List[UserRead] based on the response_model
    return users