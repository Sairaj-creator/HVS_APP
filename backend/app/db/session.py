# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
import logging
import sys # Import sys to allow exiting

# Configure logging (if not already done elsewhere)
logging.basicConfig(level=logging.INFO)

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
engine = None # Initialize engine to None

try:
    # Attempt to create the SQLAlchemy engine
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True # Checks connections before handing them out
    )
    # --- Test Connection ---
    # Try connecting to ensure credentials and host are valid
    with engine.connect() as connection:
        logging.info("--- Database engine created and connection successful. ---")

except Exception as e:
    logging.error(f"--- FATAL ERROR: Database engine creation failed: {e} ---")
    logging.error("--- Please check your DATABASE_URL in the .env file and ensure the PostgreSQL server is running. ---")
    # Exit the application if the database connection fails on startup
    sys.exit(f"Database connection failed: {e}")

# --- Create SessionLocal ONLY if engine was created successfully ---
# This check prevents the NameError
if engine:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logging.info("--- SQLAlchemy SessionLocal created successfully. ---")
else:
    # This should technically not be reached if sys.exit works, but added for safety
    logging.critical("--- FATAL ERROR: Engine is None, cannot create SessionLocal. Exiting. ---")
    sys.exit("Failed to initialize database engine.")


# --- Dependency Function ---
def get_db() -> Session:
    """
    FastAPI dependency that provides a SQLAlchemy database session.
    Ensures the session is closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db  # Provide the session to the endpoint function
    finally:
        db.close() # Ensure the session is closed, releasing resources