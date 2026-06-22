#!/usr/bin/env powershell

# Dementia Screening App - Quick Start Guide
# This script sets up and runs both backend and Python AI services

$ErrorActionPreference = "Stop"

function Write-Header {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host $args -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    Write-Host "[*] $args" -ForegroundColor Yellow
}

function Write-Success {
    Write-Host "[v] $args" -ForegroundColor Green
}

function Write-Error {
    Write-Host "[x] $args" -ForegroundColor Red
}

Write-Header "Dementia Screening App - Quick Start"

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Success "Node.js found: $nodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js 16+ from https://nodejs.org"
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Success "Python found: $pythonVersion"
} catch {
    Write-Error "Python not found. Please install Python 3.10-3.12 from https://www.python.org"
    exit 1
}

# Check FFmpeg (bypassed for this session)
# try {
#     $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
#     Write-Success "FFmpeg found: $ffmpegVersion"
# } catch {
#     Write-Error "FFmpeg not found. Install with: choco install ffmpeg"
#     exit 1
# }

# Setup Backend
Write-Header "Setting up Backend (Node.js)"

Set-Location "$PSScriptRoot\backend"

if (!(Test-Path "node_modules")) {
    Write-Step "Installing backend dependencies..."
    npm install
    Write-Success "Backend dependencies installed"
} else {
    Write-Success "Backend dependencies already installed"
}

# Check .env
if (!(Test-Path ".env")) {
    Write-Error ".env file not found!"
    Write-Step "Create .env file with the following template:"
    Write-Host "PORT=5000"
    Write-Host "NODE_ENV=development"
    Write-Host "MONGO_URI=your_mongodb_uri"
    Write-Host "JWT_SECRET=your_secret_key"
    Write-Host "JWT_EXPIRES_IN=7d"
    Write-Host "EMAIL_HOST=smtp.gmail.com"
    Write-Host "EMAIL_PORT=587"
    Write-Host "EMAIL_USER=your_email"
    Write-Host "EMAIL_PASS=your_password"
    Write-Host "CLIENT_URL=http://localhost:3000"
    Write-Host "NDI_API_URL=http://localhost:8000"
    Write-Host "GEMINI_API_KEY=your_gemini_api_key"
    exit 1
} else {
    Write-Success ".env file found"
}

# Setup Python AI
Write-Header "Setting up Python AI (FastAPI)"

Set-Location "$PSScriptRoot\ndi_project"

# Create virtual environment if not exists
if (!(Test-Path ".venv")) {
    Write-Step "Creating Python virtual environment..."
    python -m venv .venv
    Write-Success "Virtual environment created"
} else {
    Write-Success "Virtual environment already exists"
}

# Activate venv
Write-Step "Activating virtual environment..."
& ".\.venv\Scripts\Activate.ps1"

# Install dependencies
Write-Step "Installing Python dependencies..."
python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt -q

# Download spaCy model if needed
try {
    python -c "import spacy; spacy.load('en_core_web_sm')" 2>$null
    Write-Success "spaCy model already downloaded"
} catch {
    Write-Step "Downloading spaCy model..."
    python -m spacy download en_core_web_sm
    Write-Success "spaCy model downloaded"
}

# Setup Frontend
Write-Header "Setting up Frontend (React)"

Set-Location "$PSScriptRoot\ndi-dementia-screening"

if (!(Test-Path "node_modules")) {
    Write-Step "Installing frontend dependencies..."
    npm install
    Write-Success "Frontend dependencies installed"
} else {
    Write-Success "Frontend dependencies already installed"
}

# Summary
Write-Header "Setup Complete!"

Write-Host "Next steps to run the application:" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "1. Terminal 1 - Backend Server (Node.js):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host "   Runs on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "2. Terminal 2 - Python AI Server (FastAPI):" -ForegroundColor Cyan
Write-Host "   cd ndi_project" -ForegroundColor Cyan
Write-Host "   .\.venv\Scripts\Activate.ps1" -ForegroundColor Cyan
Write-Host "   uvicorn api_server:app --port 8000 --reload" -ForegroundColor Cyan
Write-Host "   Runs on: http://localhost:8000" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "3. Terminal 3 - Frontend (React):" -ForegroundColor Cyan
Write-Host "   cd ndi-dementia-screening" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host "   Runs on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "4. Test the integration:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   node test-ai-integration.js" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "Environment Variables to Set:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "- GEMINI_API_KEY: Required for audio transcription" -ForegroundColor Cyan
Write-Host "  Get from: https://ai.google.dev/" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "- MONGO_URI: MongoDB connection string" -ForegroundColor Cyan
Write-Host "  Create free cluster at: https://www.mongodb.com/cloud/atlas" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "- JWT_SECRET: Any random string (shown above)" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "- NDI_API_URL: Leave as http://localhost:8000" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "- Read AI_INTEGRATION_GUIDE.md for detailed setup and API documentation" -ForegroundColor Cyan
Write-Host "- Read backend/utils/ai-integration.js for utility functions" -ForegroundColor Cyan
Write-Host "- Check test-ai-integration.js to verify both servers are running" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "Common Issues:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "- 'AI service not reachable': Make sure Python server is running on port 8000" -ForegroundColor Cyan
Write-Host "- 'GEMINI_API_KEY not set': Set environment variable before running Python server" -ForegroundColor Cyan
Write-Host "- 'spaCy model missing': Run: python -m spacy download en_core_web_sm" -ForegroundColor Cyan
Write-Host "- 'Audio conversion fails': Install FFmpeg: choco install ffmpeg" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "Questions?" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "Check the error messages and hints provided by the server." -ForegroundColor Cyan

Write-Host ""
Write-Success "All setup complete! Ready to develop!"
Write-Host ""
