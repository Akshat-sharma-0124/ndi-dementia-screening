#!/bin/bash

# Dementia Screening App - Quick Start Guide
# This script sets up and runs both backend and Python AI services

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function header() {
    echo ""
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
}

function step() {
    echo -e "${YELLOW}[*] $1${NC}"
}

function success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

function error() {
    echo -e "${RED}[✗] $1${NC}"
}

header "Dementia Screening App - Quick Start"

# Check prerequisites
step "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js found: $NODE_VERSION"
else
    error "Node.js not found. Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    success "Python found: $PYTHON_VERSION"
else
    error "Python not found. Please install Python 3.10-3.12 from https://www.python.org"
    exit 1
fi

# Check FFmpeg
if command -v ffmpeg &> /dev/null; then
    success "FFmpeg found"
else
    error "FFmpeg not found. Install with:"
    echo "  macOS: brew install ffmpeg"
    echo "  Linux: apt-get install ffmpeg"
    exit 1
fi

# Setup Backend
header "Setting up Backend (Node.js)"

cd "$(dirname "$0")/backend"

if [ ! -d "node_modules" ]; then
    step "Installing backend dependencies..."
    npm install
    success "Backend dependencies installed"
else
    success "Backend dependencies already installed"
fi

# Check .env
if [ ! -f ".env" ]; then
    error ".env file not found!"
    step "Create .env file with the following template:"
    cat << 'EOF'
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
CLIENT_URL=http://localhost:3000
NDI_API_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key
EOF
    exit 1
else
    success ".env file found"
fi

# Setup Python AI
header "Setting up Python AI (FastAPI)"

cd "$(dirname "$0")/ndi_project"

# Create virtual environment if not exists
if [ ! -d ".venv" ]; then
    step "Creating Python virtual environment..."
    python3 -m venv .venv
    success "Virtual environment created"
else
    success "Virtual environment already exists"
fi

# Activate venv
step "Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
step "Installing Python dependencies..."
python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt -q

# Download spaCy model if needed
if python -c "import spacy; spacy.load('en_core_web_sm')" 2>/dev/null; then
    success "spaCy model already downloaded"
else
    step "Downloading spaCy model..."
    python -m spacy download en_core_web_sm
    success "spaCy model downloaded"
fi

# Setup Frontend
header "Setting up Frontend (React)"

cd "$(dirname "$0")/ndi-dementia-screening"

if [ ! -d "node_modules" ]; then
    step "Installing frontend dependencies..."
    npm install
    success "Frontend dependencies installed"
else
    success "Frontend dependencies already installed"
fi

# Summary
header "Setup Complete!"

cat << 'EOF'
Next steps to run the application:

1. Terminal 1 - Backend Server (Node.js):
   cd backend
   npm run dev
   Runs on: http://localhost:5000

2. Terminal 2 - Python AI Server (FastAPI):
   cd ndi_project
   source .venv/bin/activate
   uvicorn api_server:app --port 8000 --reload
   Runs on: http://localhost:8000

3. Terminal 3 - Frontend (React):
   cd ndi-dementia-screening
   npm run dev
   Runs on: http://localhost:3000

4. Test the integration:
   cd backend
   node test-ai-integration.js

Environment Variables to Set:
================================
- GEMINI_API_KEY: Required for audio transcription
  Get from: https://ai.google.dev/

- MONGO_URI: MongoDB connection string
  Create free cluster at: https://www.mongodb.com/cloud/atlas

- JWT_SECRET: Any random string (shown above)

- NDI_API_URL: Leave as http://localhost:8000

Documentation:
===============
- Read AI_INTEGRATION_GUIDE.md for detailed setup and API documentation
- Read backend/utils/ai-integration.js for utility functions
- Check test-ai-integration.js to verify both servers are running

Common Issues:
==============
- "AI service not reachable": Make sure Python server is running on port 8000
- "GEMINI_API_KEY not set": Set environment variable before running Python server
- "spaCy model missing": Run: python -m spacy download en_core_web_sm
- "Audio conversion fails": Install FFmpeg

Questions?
==========
Check the error messages and hints provided by the server.
EOF

echo ""
success "All setup complete! Ready to develop!"
echo ""
