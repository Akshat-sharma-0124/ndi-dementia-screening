# Dementia Screening AI Integration

## 📋 Overview

This document summarizes the complete AI integration for the Dementia Screening application. The system analyzes patient speech recordings to detect signs of cognitive decline using the **Narrative Degradation Index (NDI)** - a research-backed AI model that measures narrative coherence, acoustic features, and cognitive linguistic markers.

## 🎯 Quick Start

### For Windows (PowerShell):
```powershell
.\QUICK_START.ps1
```

### For macOS/Linux (Bash):
```bash
chmod +x QUICK_START.sh
./QUICK_START.sh
```

Then follow the printed instructions to run the three servers.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│               (Records audio, displays reports)              │
│                  http://localhost:3000                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ POST /api/screening/analyze
                               │ (audio + task info)
                               ↓
┌──────────────────────────────────────────────────────────────┐
│              Backend (Node.js/Express)                       │
│          (Authentication, API routing, DB storage)           │
│                  http://localhost:5000                       │
│                                                              │
│  • Authentication (JWT)                                     │
│  • Audio file validation                                    │
│  • Forwards to Python AI                                    │
│  • Stores reports in MongoDB                                │
└──────────────────────────────┬──────────────────────────────┘
                               │ FormData with audio
                               ↓
┌──────────────────────────────────────────────────────────────┐
│            Python AI API (FastAPI)                           │
│            (NDI Analysis Engine)                             │
│                  http://localhost:8000                       │
│                                                              │
│  1. Audio Conversion → 16kHz mono WAV                       │
│  2. Transcription → Google Gemini API                       │
│  3. Feature Extraction:                                     │
│     • Coherence metrics (TF-IDF)                            │
│     • Story grammar analysis                                │
│     • Acoustic biomarkers (librosa)                         │
│  4. NDI Calculation (weighted formula)                      │
│  5. Risk Classification                                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON analysis result
                               ↓
                        Backend ←─┘
                           │
                    Save to MongoDB
                           │
                      Frontend ←┘
                    Display Report
```

## 📁 Project Structure

```
dementia/
├── backend/                        # Node.js/Express backend
│   ├── routes/
│   │   ├── auth.js                # Authentication routes
│   │   ├── profile.js             # User profile routes
│   │   ├── reports.js             # Report CRUD routes
│   │   └── screening.js           # ⭐ Audio analysis endpoint
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Report.js              # Report schema
│   │   └── ...
│   ├── middleware/
│   │   └── auth.js                # JWT authentication
│   ├── utils/
│   │   └── ai-integration.js      # ⭐ AI utility functions
│   ├── server.js                  # Express app setup
│   ├── package.json               # Node dependencies
│   ├── .env                       # Environment config
│   └── test-ai-integration.js     # ⭐ Integration test script
│
├── ndi_project/                    # Python FastAPI AI server
│   ├── src/
│   │   ├── predict.py             # Main prediction pipeline
│   │   ├── ndi_engine.py          # NDI calculation
│   │   ├── narrative_analysis.py  # Story grammar
│   │   ├── speech_biomarkers.py   # Acoustic features
│   │   ├── speech_to_text.py      # Transcription
│   │   └── ...
│   ├── api_server.py              # ⭐ FastAPI endpoints
│   ├── requirements.txt           # Python dependencies
│   └── .venv/                     # Virtual environment
│
├── ndi-dementia-screening/         # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── Recording.tsx      # Audio recording UI
│   │   │   └── Report.tsx         # Results display
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── AI_INTEGRATION_GUIDE.md        # ⭐ Detailed technical guide
├── QUICK_START.ps1                # ⭐ Setup script (Windows)
├── QUICK_START.sh                 # ⭐ Setup script (Linux/macOS)
└── README.md                       # This file
```

## 🔌 API Endpoints

### Backend Endpoint

**POST `/api/screening/analyze`**
- **Authentication**: Required (JWT token)
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `audio` (File): Audio recording (WebM, WAV, OGG, MP3, M4A)
  - `taskType` (String): Task type (optional, default: "free-speech")
  - `taskPrompt` (String): Task instructions (optional)
  - `taskTitle` (String): Task name (optional)

**Response (200 OK)**:
```json
{
  "ndiScore": 35,
  "status": "Mild / Dynamic Variation",
  "riskLevel": "Low",
  "transcript": "The woman is washing dishes...",
  "localCoherence": 75.5,
  "globalCoherence": 68.2,
  "storyGrammar": 4,
  "speechRate": 125,
  "averagePause": 0.8,
  "longestPause": 2.1,
  "whyThisScore": ["Strong coherence...", "Normal speech rate..."],
  "annotatedWords": [{"text": "The", "type": "normal"}, ...],
  "predictedClass": "healthy",
  "classProbabilities": {"healthy": 0.85, "mci": 0.12, ...}
}
```

### Python API Endpoints

**POST `/analyze`**
- Accepts multipart audio + task metadata
- Returns full NDI analysis

**GET `/health`**
- Health check endpoint
- Returns service status

## 🚀 Running the System

### 1. Start Backend
```bash
cd backend
npm run dev
# Listens on http://localhost:5000
```

### 2. Start Python AI
```bash
cd ndi_project
source .venv/bin/activate    # or .\.venv\Scripts\Activate.ps1 on Windows
export GEMINI_API_KEY="your-api-key"
uvicorn api_server:app --port 8000 --reload
# Listens on http://localhost:8000
```

### 3. Start Frontend
```bash
cd ndi-dementia-screening
npm run dev
# Listens on http://localhost:3000
```

### 4. Test Integration
```bash
cd backend
node test-ai-integration.js
```

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dementia-ii

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AI Service
NDI_API_URL=http://localhost:8000
GEMINI_API_KEY=your-gemini-api-key

# Client
CLIENT_URL=http://localhost:3000
```

**Required API Key**:
- **GEMINI_API_KEY**: Get from [Google AI Studio](https://ai.google.dev)

## 📊 NDI Scoring System

### Scoring Formula

NDI = 100 - Quality Score

Where Quality Score combines:
- **Local Coherence (25%)**: Sentence-to-sentence logical flow (0-100)
- **Global Coherence (25%)**: Overall narrative structure (0-100)
- **Story Grammar (20%)**: Presence of story components (0-100)
- **Speech Rate Quality (15%)**: Optimal 100-160 WPM (0-100)
- **Pause Quality (15%)**: Optimal <1 second average (0-100)

### Risk Levels

| NDI Score | Risk Level | Status | Interpretation |
|-----------|-----------|--------|-----------------|
| 0-20 | Low | Mild / Dynamic Variation | Healthy cognitive function |
| 20-60 | Moderate | Moderate Communication Change | Possible mild cognitive impairment |
| 60-100 | High | Significant Narrative Degradation | Significant cognitive concerns |

### Cognitive Markers Analyzed

1. **Narrative Coherence**: How logically organized the story is
2. **Story Grammar**: Presence of setting, characters, goals, outcomes
3. **Lexical Richness**: Vocabulary diversity
4. **Speech Fluency**: Speech rate and pause patterns
5. **Repetition**: Frequency of repeated phrases
6. **Acoustic Features**: Pauses, speech rate, duration

## ⚙️ Implementation Details

### Key Components

**Backend Utils** (`backend/utils/ai-integration.js`):
- `analyzeAudio()`: Send audio to Python API
- `validateAudioFile()`: File format/size validation
- `validateAnalysisResult()`: Result schema validation
- `checkNDIHealth()`: Service health check
- `formatReportData()`: Transform API response for storage

**Screening Route** (`backend/routes/screening.js`):
- Authenticated audio upload
- File validation
- AI service error handling
- Result validation
- Health endpoint

**Database Schema** (`backend/models/Report.js`):
- User reference (linked to patient)
- Task metadata
- All NDI metrics
- Transcript and annotated words
- Timestamps for historical tracking

### Error Handling

The system provides helpful error messages:

| Error | Cause | Solution |
|-------|-------|----------|
| "AI service not reachable" | Python API not running | Start: `uvicorn api_server:app --port 8000` |
| "GEMINI_API_KEY not set" | Missing API key | Set environment variable before running |
| "spaCy model missing" | NLP model not downloaded | Run: `python -m spacy download en_core_web_sm` |
| "Audio conversion failed" | FFmpeg missing | Install: `choco install ffmpeg` (Windows) |
| "Analysis took too long" | Timeout after 2 minutes | Use shorter audio files |

## 🧪 Testing

### Unit Tests (Python)
```bash
cd ndi_project
pytest tests/
```

### Integration Test (Node)
```bash
cd backend
node test-ai-integration.js
```

### Manual API Test
```bash
# Create test audio (10 seconds of silence)
ffmpeg -f lavfi -i anullsrc=r=16000:cl=mono -t 10 -q:a 9 -acodec libmp3lame test.mp3

# Upload and analyze (with JWT token)
curl -X POST http://localhost:5000/api/screening/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "audio=@test.mp3" \
  -F "taskType=picture-description" \
  -F "taskTitle=Test Recording"
```

## 📚 Documentation

- **[AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md)**: Detailed technical guide with troubleshooting
- **[backend/utils/ai-integration.js](./backend/utils/ai-integration.js)**: Utility function documentation
- **[backend/routes/screening.js](./backend/routes/screening.js)**: API endpoint code with comments
- **[test-ai-integration.js](./backend/test-ai-integration.js)**: Integration test with examples

## 🔐 Security Notes

1. **Authentication**: All endpoints require JWT token (except /health)
2. **File Limits**: 50MB max audio file size
3. **CORS**: Frontend origin restricted to CLIENT_URL
4. **API Keys**: Never commit `.env` to version control
5. **Audio Privacy**: Files processed in-memory, not permanently stored
6. **Rate Limiting**: Consider adding rate limits for production

## ⚡ Performance

- **Processing Time**: 30-60 seconds per recording
- **Model Inference**: 5-10 seconds (depends on audio length)
- **Memory Usage**: ~800MB-1GB (Python process)
- **Timeout**: 2 minutes per request
- **Concurrent Requests**: Limited by machine resources

## 🚨 Important Notes

### ⚠️ This is NOT a Medical Device
This software is an **academic prototype** for research purposes only. It is **NOT clinically validated** and should **NOT** be used for:
- Clinical diagnosis
- Medical treatment decisions
- Patient triage
- Any clinical decision making

### Research Use Only
Use only in controlled research settings with IRB approval.

## 🔄 Workflow

```
1. Patient Records Audio
   ↓
2. Frontend Uploads to Backend
   ↓
3. Backend Validates & Forwards to Python AI
   ↓
4. Python AI:
   - Converts audio format
   - Transcribes with Gemini
   - Extracts features
   - Calculates NDI score
   ↓
5. Backend Stores Report in MongoDB
   ↓
6. Frontend Displays Report & History
```

## 📞 Support

For issues or questions:
1. Check the error messages and hints provided
2. Review [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md)
3. Run the integration test: `node backend/test-ai-integration.js`
4. Check server logs for detailed error information

## 📝 Next Steps

1. ✅ Run QUICK_START script
2. ✅ Start all three servers
3. ✅ Create a test account
4. ✅ Record a test screening
5. ✅ Review the generated report
6. ✅ Check test-ai-integration.js results
7. ✅ Review logs for any issues

## 📄 License

Academic research prototype. Consult with your institution's legal team for usage terms.

---

**Version**: 1.0.0  
**Last Updated**: June 2024  
**Status**: ✅ Ready for Integration Testing
