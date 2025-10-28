# app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from jose import JWTError, jwt
from passlib.context import CryptContext

# Import the settings instance, which loads .env variables
from app.core.config import settings
import logging

# Configure logging (can be enhanced later)
logging.basicConfig(level=logging.INFO)

# --- Password Hashing Setup ---
# Using bcrypt as the hashing scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- JWT Configuration ---
# These values are loaded from your .env file via the settings object
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# --- Password Utilities ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored hash.

    Args:
        plain_password: The password entered by the user.
        hashed_password: The hash stored in the database.

    Returns:
        True if the password matches the hash, False otherwise.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # Log potential errors during verification (e.g., invalid hash format)
        logging.error(f"Error verifying password: {e}")
        return False

def get_password_hash(password: str) -> str:
    """
    Hashes a plain-text password using bcrypt.

    Args:
        password: The plain-text password to hash.

    Returns:
        The resulting password hash as a string.
    """
    return pwd_context.hash(password)

# --- JWT Token Utilities ---
def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a JWT access token.

    Args:
        subject: The identifier for whom the token is created (e.g., user's email/username or ID).
                 Must be convertible to a string.
        expires_delta: Optional timedelta object to specify custom expiry.
                 If None, uses ACCESS_TOKEN_EXPIRE_MINUTES from settings.

    Returns:
        The encoded JWT access token string.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Standard JWT claims: 'exp' (expiration time), 'sub' (subject)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logging.info(f"Generated JWT for subject: {subject}")
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """
    Decodes and verifies a JWT token.

    Args:
        token: The JWT token string to verify.

    Returns:
        The subject (e.g., username/ID) stored in the token if valid and not expired,
        otherwise None.
    """
    try:
        # jwt.decode handles expiration ('exp') validation automatically
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        subject: Optional[str] = payload.get("sub")
        if subject is None:
            logging.warning("JWT token verification failed: Missing 'sub' (subject) claim.")
            return None
        # Optionally add other claim validations here if needed
        logging.debug(f"JWT verified successfully for subject: {subject}")
        return subject
    except jwt.ExpiredSignatureError:
        logging.warning("JWT token verification failed: Token has expired.")
        return None
    except JWTError as e:
        # Catches various JWT format/signature errors
        logging.error(f"JWT token verification failed: Invalid token - {e}")
        return None
    except Exception as e:
        # Catch unexpected errors during decoding
        logging.error(f"An unexpected error occurred during token verification: {e}")
        return None