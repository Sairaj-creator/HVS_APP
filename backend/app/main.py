# app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
from app.db.session import engine # Import the engine

# --- Import Routers ---
from app.api.endpoints import auth      # Existing auth router
from app.api.endpoints import patients  # Existing patients router
from app.api.endpoints import encounters # Existing encounters router
from app.api.endpoints import tasks      # *** NEW: Import the tasks router ***
from app.api.endpoints import handoff    # *** Don't forget the WebSocket router ***

# --- Lifespan Event Handler (Database Check) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Application startup...")
    try:
        with engine.connect() as connection:
            logging.info("--- Database connection successful during startup! ---")
    except Exception as e:
        logging.error(f"--- Database connection failed during startup: {e} ---")
        # raise SystemExit(f"Database connection failed: {e}") # Optional: Exit if DB fails
    yield
    logging.info("Application shutdown...")
    engine.dispose()

# --- FastAPI App Initialization ---
app = FastAPI(title="HVS Backend", lifespan=lifespan)

# --- Include Routers ---
# Authentication routes
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])

# Patient routes
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])

# Encounter routes
app.include_router(encounters.router, prefix="/api/v1/encounters", tags=["Encounters"])

# *** NEW: Include Task routes (e.g., /api/v1/tasks/) ***
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])

# *** Don't forget to include the WebSocket router ***
# from app.api.endpoints import handoff
app.include_router(handoff.router) # Often WebSocket routes don't have a prefix

# --- Root Endpoint (Optional: for basic check) ---
@app.get("/")
def read_root():
    return {"Status": "HVS Backend Running"}

# --- Direct Run Block (Keep for development) ---
if __name__ == "__main__":
    import uvicorn
    # Use the command line 'uvicorn app.main:app --reload' for full features
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)