# AI Integration Guide - Dementia Screening App

## Overview

This document explains how the AI (NDI - Narrative Degradation Index) is integrated into the backend to analyze patient audio recordings for dementia screening.

### Architecture

```
Frontend (React)
     ↓
  Record Audio (WebM/WAV/OGG)
     ↓
Backend (Node.js/Express)
     ↓ POST /api/screening/analyze
Python API (FastAPI)
     ↓
  - Audio Conversion (WebM → WAV)
  - Transcription (Gemini API)
  - Feature Extraction:
    • Coherence (local & global)
    • Story Grammar Analysis
    • Acoustic Biomarkers (speech rate, pauses)
  - NDI Score Calculation
     ↓
  JSON Response with Analysis Results
     ↓
Backend stores in MongoDB
     ↓
Frontend displays Report
```

## Setup Instructions

### Prerequisites

1. **Backend Requirements:**
   - Node.js 16+ 
   - npm
   - MongoDB (local or cloud connection)

2. **Python AI Requirements:**
   - Python 3.10-3.12
   - FFmpeg (for audio processing)
   - Virtual environment

3. **API Keys:**
   - GEMINI_API_KEY (for audio transcription)

### Step 1: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create/verify .env file has:
# - MONGO_URI
# - JWT_SECRET
# - GEMINI_API_KEY
# - NDI_API_URL=http://localhost:8000
# - CLIENT_URL=http://localhost:3000

# Start backend server
npm run dev
# Server runs on http://localhost:5000
```

### Step 2: Python AI Setup

```bash
cd ndi_project

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Download spaCy model (if needed)
python -m spacy download en_core_web_sm

# Set environment variables
$env:GEMINI_API_KEY = "your-api-key-here"

# Start FastAPI server
uvicorn api_server:app --port 8000 --reload
# API runs on http://localhost:8000
```

### Step 3: Frontend Setup

```bash
cd ndi-dementia-screening

npm install

npm run dev
# Frontend runs on http://localhost:3000
```

## API Endpoint

### POST /api/screening/analyze

**Authentication:** Required (JWT token)

**Request:**
```
Content-Type: multipart/form-data

- audio: (File) Audio file (WebM, WAV, OGG, MP3, M4A)
- taskType: (String) Type of task (default: "free-speech")
  - "picture-description"
  - "story-recall"
  - "free-speech"
  - "facial-expression"
  - "describe-day"
- taskPrompt: (String) Instructions given to patient
- taskTitle: (String) Human-readable task name
```

**Response (Success - 200):**
```json
{
  "transcript": "The woman is washing dishes at the sink...",
  "ndiScore": 35,
  "status": "Mild / Dynamic Variation",
  "riskLevel": "Low",
  "localCoherence": 75.5,
  "globalCoherence": 68.2,
  "storyGrammar": 4,
  "speechRate": 125,
  "averagePause": 0.8,
  "longestPause": 2.1,
  "whyThisScore": [
    "Strong sentence-to-sentence coherence (75/100)...",
    "Normal speech rate (125 WPM)..."
  ],
  "transcript": "...",
  "annotatedWords": [
    {"text": "The", "type": "normal"},
    {"text": "um", "type": "filler"}
  ],
  "lexicalRichness": 82.5,
  "repetitionScore": 90.1,
  "ndiRaw": 35.42,
  "storyComponents": {
    "setting": true,
    "characters": true,
    "goal": true,
    "attempt": true,
    "outcome": false,
    "resolution": false
  },
  "predictedClass": "healthy",
  "classProbabilities": {
    "healthy": 0.85,
    "mci": 0.12,
    "moderate": 0.02,
    "severe": 0.01
  }
}
```

**Response (Error - 503):**
```json
{
  "message": "The AI analysis service is not reachable.",
  "hint": "Run: cd ndi_project && .venv\\Scripts\\uvicorn api_server:app --port 8000"
}
```

## NDI Scoring

The NDI (Narrative Degradation Index) is calculated as:

### Components (0-100 scale):
1. **Local Coherence** (25%): Sentence-to-sentence logical flow
2. **Global Coherence** (25%): Overall narrative alignment with expected structure
3. **Story Grammar** (20%): Presence of setting, characters, goals, attempts, outcomes, resolution
4. **Speech Rate Quality** (15%): Words per minute (optimal: 100-160 WPM)
5. **Pause Quality** (15%): Average pause duration (optimal: <1 second)

### Risk Levels:
- **Low Risk (NDI < 20)**: "Mild / Dynamic Variation" - Normal healthy speech
- **Moderate Risk (20 ≤ NDI < 60)**: "Moderate Communication Change Detected" - Possible mild cognitive impairment
- **High Risk (NDI ≥ 60)**: "Significant Narrative Degradation Detected" - More significant cognitive concerns

## Data Flow

### 1. Audio Recording (Frontend)
- User completes screening task with audio recording
- Audio sent as WebM/WAV to backend `/api/screening/analyze`

### 2. Backend Processing
- Receives audio file via multer
- Validates file is audio format
- Forwards to Python API with task metadata
- Handles timeout (2 minutes) for model inference

### 3. Python AI Processing
- Converts audio to WAV (16kHz mono) using PyAV
- Transcribes with Google Gemini (with multi-model fallback)
- Extracts features:
  - Coherence via TF-IDF similarity (scikit-learn)
  - Story grammar via keyword detection
  - Acoustic biomarkers via librosa (speech rate, pauses, duration)
  - Lexical richness and repetition
- Calculates weighted NDI score
- Optional: Runs Random Forest classifier (if model trained on real audio)

### 4. Storage
- Backend receives analysis
- Stores report in MongoDB with user reference
- Frontend displays results on Report page

### 5. History
- All reports linked to user in MongoDB
- User can view screening history

## Environment Variables

**Backend (.env):**
```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AI Service
NDI_API_URL=http://localhost:8000
GEMINI_API_KEY=your-gemini-api-key

# Client
CLIENT_URL=http://localhost:3000
```

## Troubleshooting

### Issue: "AI analysis service is not reachable"
**Solution:** Ensure Python API is running on port 8000
```bash
cd ndi_project
.\.venv\Scripts\Activate.ps1
uvicorn api_server:app --port 8000
```

### Issue: "GEMINI_API_KEY not set in environment"
**Solution:** Set environment variable before running Python API
```bash
$env:GEMINI_API_KEY = "your-api-key"
# Then run uvicorn
```

### Issue: "spaCy model missing"
**Solution:** Download the required model
```bash
python -m spacy download en_core_web_sm
```

### Issue: Audio conversion fails
**Solution:** Ensure FFmpeg is installed
- Windows: `choco install ffmpeg`
- macOS: `brew install ffmpeg`
- Linux: `apt-get install ffmpeg`

### Issue: Model inference timeout
**Solution:** Increase timeout or reduce audio length
- Backend timeout is currently 2 minutes
- User should keep recordings under 2 minutes

## Testing

### Test 1: Health Check
```bash
# Backend health
curl http://localhost:5000/health

# Python API health  
curl http://localhost:8000/health
```

### Test 2: Audio Analysis (with auth)
```bash
# Create a test request (see test script below)
curl -X POST http://localhost:5000/api/screening/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "audio=@recording.wav" \
  -F "taskType=picture-description" \
  -F "taskPrompt=Describe what you see" \
  -F "taskTitle=Cookie Theft"
```

### Test 3: Save Report
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rep-001",
    "date": "2024-06-21",
    "taskType": "picture-description",
    "taskTitle": "Cookie Theft",
    "ndiScore": 35,
    "status": "Mild / Dynamic Variation",
    "riskLevel": "Low",
    "localCoherence": 75.5,
    "globalCoherence": 68.2,
    "storyGrammar": 4,
    "speechRate": 125,
    "averagePause": 0.8,
    "longestPause": 2.1,
    "whyThisScore": [],
    "transcript": "..."
  }'
```

## Security Considerations

1. **Authentication**: All endpoints require JWT token
2. **File Upload**: Limited to audio files, 50MB max
3. **CORS**: Configured to accept only from CLIENT_URL
4. **API Keys**: GEMINI_API_KEY should never be in frontend
5. **Audio Storage**: Files are processed in memory/temp, not permanently stored

## Monitoring

### Backend Logs
Watch for:
- API errors when reaching NDI service
- File format/conversion errors
- Database connection issues
- JWT authentication failures

### Python API Logs
Watch for:
- Gemini API rate limiting
- Audio processing failures
- Model inference timeouts
- Out of memory errors

## Performance Notes

- **Audio Processing**: ~30-60 seconds per recording (depends on audio length)
- **Model Inference**: ~5-10 seconds
- **Memory Usage**: Python process ~800MB-1GB (with librosa, transformers)
- **Timeout**: 2 minutes per request

## FAQ

**Q: Can I run the Python API on a different machine?**
A: Yes, update `NDI_API_URL` in backend .env to point to remote server.

**Q: What audio formats are supported?**
A: WebM, WAV, OGG, MP3, M4A (converted to 16kHz mono WAV internally)

**Q: Can I train the classifier on custom data?**
A: Yes, add WAV files to `ndi_project/data/{label}/` and run `python -m src.train_classifier`

**Q: Is this a medical device?**
A: No. This is an academic prototype for research only. It should not be used for clinical diagnosis.

**Q: How is the NDI score validated?**
A: The NDI uses research-backed metrics from cognitive linguistics and acoustic analysis.

## Next Steps

1. Start both servers (backend & Python API)
2. Run frontend
3. Create a test account
4. Record a test screening task
5. Review the generated report
6. Iterate based on feedback
