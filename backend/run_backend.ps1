# run_backend.ps1 - helper to setup venv (if needed), create .env (SQLite), bootstrap admin, and run uvicorn
# Run this from the backend folder in PowerShell:
#   .\run_backend.ps1

param(
  [switch]$RecreateVenv
)

$ErrorActionPreference = 'Stop'

Write-Host "Running backend helper script..." -ForegroundColor Cyan

# 1) Create .env if missing
if (-not (Test-Path .env)) {
    Write-Host "Creating .env with SQLite DATABASE_URL..." -ForegroundColor Yellow
    $envContent = @"
DATABASE_URL=sqlite:///./dev.db
SECRET_KEY=dev-secret-for-local
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256
"@
    # Write UTF8 without BOM so python-dotenv can read it
    Set-Content -LiteralPath .env -Value $envContent -Encoding utf8
} else {
  Write-Host ".env already exists - skipping creation" -ForegroundColor Green
}

# 2) Setup virtualenv
if ($RecreateVenv) {
  if (Test-Path .venv) {
    Write-Host "Recreating virtual environment: removing existing .venv..." -ForegroundColor Yellow
    Remove-Item -LiteralPath .venv -Recurse -Force -ErrorAction SilentlyContinue
  }
}

if (-not (Test-Path .venv)) {
  Write-Host "Creating virtual environment .venv..." -ForegroundColor Yellow
  python -m venv .venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
. .\.venv\Scripts\Activate.ps1

# 3) Install requirements
if (Test-Path requirements.txt) {
  Write-Host "Installing requirements (may take a minute)..." -ForegroundColor Yellow
  pip install --upgrade pip
  pip install -r requirements.txt
} else {
  Write-Host "No requirements.txt found - skipping pip install" -ForegroundColor Yellow
}

# 4) Run alembic upgrade head if alembic is available
if (Get-Command alembic -ErrorAction SilentlyContinue) {
  Write-Host "Running alembic upgrade head..." -ForegroundColor Yellow
  alembic upgrade head
} else {
  Write-Host "alembic not found, skipping migrations" -ForegroundColor Yellow
}

# 5) Bootstrap admin user
Write-Host "Bootstrapping admin user (create_admin.py)..." -ForegroundColor Yellow
python create_admin.py
if ($LASTEXITCODE -ne 0) {
  Write-Host "create_admin.py failed or admin exists - continuing" -ForegroundColor DarkYellow
}

# 6) Start uvicorn
Write-Host "Starting uvicorn app (ctrl+C to stop)..." -ForegroundColor Green
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
