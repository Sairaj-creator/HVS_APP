# create_admin.py
import logging
from sqlalchemy.orm import Session
import app.db.base
# Import necessary components from your application structure
# Adjust paths if your structure is slightly different
from app.db.session import SessionLocal
from app.schemas.user import UserCreate
from app.services import user_service
from app.models.user import UserRole # Import the UserRole enum

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# --- Configure Admin User Details ---
ADMIN_USERNAME = "admin@hospital.com" # Replace with your desired admin email
ADMIN_PASSWORD = "VerySecureAdminPassword123!" # Replace with a strong password
ADMIN_FULL_NAME = "Hospital Admin"
# --- End Configuration ---

def create_first_admin(db: Session) -> None:
    """Creates the initial admin user if they don't exist."""
    log.info(f"Checking if admin user '{ADMIN_USERNAME}' exists...")
    user = user_service.get_user_by_username(db, username=ADMIN_USERNAME)

    if user:
        log.info(f"Admin user '{ADMIN_USERNAME}' already exists. Skipping creation.")
        return

    log.info(f"Admin user '{ADMIN_USERNAME}' not found. Attempting creation...")
    user_in = UserCreate(
        username=ADMIN_USERNAME,
        password=ADMIN_PASSWORD,
        full_name=ADMIN_FULL_NAME,
        role=UserRole.ADMIN # Set the role specifically to ADMIN
    )
    new_admin = user_service.create_user(db=db, user_in=user_in)

    if new_admin:
        log.info(f"Successfully created admin user: {new_admin.username}")
    else:
        log.error(f"Failed to create admin user: {ADMIN_USERNAME}. Check previous logs for errors.")

if __name__ == "__main__":
    log.info("--- Running Admin User Bootstrap Script ---")
    db = SessionLocal()
    try:
        create_first_admin(db)
    finally:
        db.close()
        log.info("--- Admin Bootstrap Script Finished ---")