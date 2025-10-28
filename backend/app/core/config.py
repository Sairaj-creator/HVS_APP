# app/core/config.py
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
import logging # Added for better debugging

# Configure logging
logging.basicConfig(level=logging.INFO)

# --- Load Environment Variables ---
# Construct the path to the .env file relative to this config.py file
# Assumes .env is in the 'backend/' directory, which is 2 levels up from app/core/
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')

# Explicitly load the .env file before initializing Settings
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
    logging.info(f"Successfully loaded .env file from: {env_path}")
else:
    logging.warning(f".env file not found at expected path: {env_path}. Relying on environment variables.")

# --- Settings Model ---
class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or .env file.
    Provides default values primarily for documentation purposes;
    actual values should be set in the environment/.env.
    """
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@host:port/default_db_name")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "!!!REPLACE_WITH_A_REAL_SECRET_KEY_IN_DOTENV!!!")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)) # Using 60 mins as discussed

    class Config:
        # Pydantic-settings uses python-dotenv automatically if installed,
        # but explicit loading above gives more control.
        # env_file = ".env" # Can specify here too, but load_dotenv is clearer
        env_file_encoding = 'utf-8'

# --- Instantiate Settings ---
# Create a single instance of the Settings class to be imported by other modules
try:
    settings = Settings()
    # --- TEMPORARY DEBUG PRINT ---
    print(f"DEBUG: Loaded DATABASE_URL = '{settings.DATABASE_URL}'")
    # --- END DEBUG PRINT ---
    logging.info(f"Database URL loaded (partial): {settings.DATABASE_URL[:15]}...")
    # ... (rest of the logging and error handling) ...
except Exception as e:
    logging.critical(f"FATAL ERROR: Could not load settings. Check .env file and environment variables. Error: {e}", exc_info=True)
    # Depending on deployment strategy, you might want the application to exit if settings fail
    raise SystemExit(f"FATAL ERROR loading settings: {e}")

# Final confirmation (helps prevent import errors later)
if 'settings' not in globals():
     raise ImportError("Could not initialize 'settings' object in config.py")