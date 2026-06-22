# AI Integration Setup Checklist

Use this checklist to verify your AI integration setup is complete and working.

## ✅ Pre-Setup Requirements

- [ ] **Node.js installed** (v16 or higher)
  - Verify: `node --version`
  
- [ ] **Python installed** (v3.10-3.12)
  - Verify: `python --version` or `python3 --version`
  
- [ ] **FFmpeg installed**
  - Windows: `choco install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Linux: `apt-get install ffmpeg`
  - Verify: `ffmpeg -version`

- [ ] **MongoDB connection string** ready
  - Cloud: MongoDB Atlas connection string
  - Local: `mongodb://localhost:27017/dementia-screening`

- [ ] **Google Gemini API key** obtained
  - Get from: https://ai.google.dev
  - Create an API key for free tier

## 🔧 Backend Setup (Node.js)

### Installation
- [ ] Navigate to `backend/` folder
- [ ] Run `npm install` successfully
- [ ] `.env` file exists in `backend/`

### Environment Configuration
- [ ] `PORT=5000` configured
- [ ] `MONGO_URI` set to your MongoDB connection
- [ ] `JWT_SECRET` set to a random string
- [ ] `NDI_API_URL=http://localhost:8000` configured
- [ ] `GEMINI_API_KEY` set
- [ ] `CLIENT_URL=http://localhost:3000` configured

### Utilities
- [ ] `backend/utils/ai-integration.js` exists
- [ ] Contains the following functions:
  - [ ] `analyzeAudio()`
  - [ ] `validateAudioFile()`
  - [ ] `validateAnalysisResult()`
  - [ ] `checkNDIHealth()`
  - [ ] `formatReportData()`

### Routes
- [ ] `backend/routes/screening.js` updated
- [ ] Contains improved error handling
- [ ] Has `/analyze` endpoint
- [ ] Has `/health` endpoint

### Testing
- [ ] `backend/test-ai-integration.js` exists
- [ ] Can run: `node test-ai-integration.js`

## 🐍 Python AI Setup (FastAPI)

### Virtual Environment
- [ ] Virtual environment created at `ndi_project/.venv`
- [ ] Can activate:
  - Windows: `.\.venv\Scripts\Activate.ps1`
  - Linux/macOS: `source .venv/bin/activate`

### Dependencies
- [ ] `requirements.txt` exists
- [ ] All dependencies installed: `pip install -r requirements.txt`
- [ ] spaCy model downloaded: `python -m spacy download en_core_web_sm`

### Environment Setup
- [ ] `GEMINI_API_KEY` environment variable set
- [ ] Can start FastAPI: `uvicorn api_server:app --port 8000`

### API Server
- [ ] `api_server.py` contains FastAPI app
- [ ] Has `/analyze` endpoint (POST)
- [ ] Has `/health` endpoint (GET)

## 📱 Frontend Setup (React)

### Installation
- [ ] Navigate to `ndi-dementia-screening/` folder
- [ ] Run `npm install` successfully
- [ ] All dependencies installed

### Configuration
- [ ] Connects to backend at `http://localhost:5000`
- [ ] Recording page works
- [ ] Results display works

## 🚀 Running the System

### Start Backend
- [ ] Terminal 1: `cd backend && npm run dev`
- [ ] Backend starts on `http://localhost:5000`
- [ ] No connection errors in console
- [ ] Health check works: `curl http://localhost:5000/health`

### Start Python AI
- [ ] Terminal 2: `cd ndi_project && source .venv/bin/activate`
- [ ] Set: `export GEMINI_API_KEY="your-key"` (Windows: use `$env:`)
- [ ] Run: `uvicorn api_server:app --port 8000 --reload`
- [ ] API starts on `http://localhost:8000`
- [ ] No errors in console
- [ ] Health check works: `curl http://localhost:8000/health`

### Start Frontend
- [ ] Terminal 3: `cd ndi-dementia-screening && npm run dev`
- [ ] Frontend starts on `http://localhost:3000`
- [ ] No build errors
- [ ] Page loads in browser

## 🧪 Integration Testing

### Test 1: Backend Health
```bash
# From backend folder
curl http://localhost:5000/health
```
- [ ] Returns healthy status
- [ ] Shows uptime

### Test 2: Python API Health
```bash
# From backend folder
curl http://localhost:8000/health
```
- [ ] Returns healthy status
- [ ] Shows API is ready

### Test 3: Full Integration Test
```bash
# From backend folder
node test-ai-integration.js
```
- [ ] Config check passes
- [ ] Backend health check passes
- [ ] NDI health check passes
- [ ] Shows "Integration is READY!"

### Test 4: Manual Audio Analysis
- [ ] Create test audio (or record one)
- [ ] Create user account in frontend
- [ ] Get JWT token from login
- [ ] Upload audio to `/api/screening/analyze`
- [ ] Receives analysis result with:
  - [ ] `ndiScore` (0-100)
  - [ ] `status` (string)
  - [ ] `riskLevel` (Low/Moderate/High)
  - [ ] `transcript` (not empty)
  - [ ] Other metrics

### Test 5: Report Storage
- [ ] Analysis result saved to MongoDB
- [ ] Can retrieve via `/api/reports` endpoint
- [ ] Shows in user's report history
- [ ] All fields correctly stored

## 📊 Data Verification

### Audio Processing
- [ ] Audio file uploaded successfully
- [ ] File format recognized (WebM/WAV/MP3/etc)
- [ ] No conversion errors

### Transcription
- [ ] Gemini API returns transcript
- [ ] Transcript is not empty
- [ ] Transcript makes sense

### Feature Extraction
- [ ] Local coherence score (0-100)
- [ ] Global coherence score (0-100)
- [ ] Story grammar score (0-6)
- [ ] Speech rate in WPM
- [ ] Pause metrics calculated
- [ ] All values are reasonable

### NDI Calculation
- [ ] NDI score calculated (0-100)
- [ ] Risk level determined (Low/Moderate/High)
- [ ] Status message generated
- [ ] Why score explanations provided

## 🔍 Debugging Checklist

If something doesn't work:

### Backend Issues
- [ ] Check `.env` file exists and has all required keys
- [ ] Check MongoDB connection: `MONGO_URI` is valid
- [ ] Check port 5000 is available
- [ ] Check all Node modules installed: `npm install`
- [ ] Check error logs for specific errors

### Python AI Issues
- [ ] Check virtual environment is activated
- [ ] Check `GEMINI_API_KEY` is set
- [ ] Check FFmpeg installed: `ffmpeg -version`
- [ ] Check port 8000 is available
- [ ] Check spaCy model: `python -m spacy download en_core_web_sm`
- [ ] Check all Python dependencies: `pip install -r requirements.txt`

### Frontend Issues
- [ ] Check Node modules installed: `npm install`
- [ ] Check backend URL is correct in config
- [ ] Check JWT token is valid
- [ ] Check browser console for errors
- [ ] Check CORS settings in backend

### Connection Issues
- [ ] Verify both servers are running
- [ ] Check firewall not blocking ports (5000, 8000, 3000)
- [ ] Check API URLs are correct
- [ ] Try running test: `node test-ai-integration.js`

## 📝 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "AI service not reachable" | Start Python server on port 8000 |
| "GEMINI_API_KEY not set" | Set environment variable before starting Python |
| "spaCy model missing" | Run: `python -m spacy download en_core_web_sm` |
| "Port 8000 already in use" | Change port or kill process using it |
| "Cannot connect to MongoDB" | Verify connection string and network access |
| "Audio format not supported" | Ensure audio is WebM, WAV, MP3, or OGG |
| "Timeout during analysis" | Use shorter audio files (under 2 minutes) |

## ✨ Final Verification

- [ ] All three servers running without errors
- [ ] Integration test passes
- [ ] Can record audio in frontend
- [ ] Audio uploads successfully
- [ ] Gets analysis result back
- [ ] Report displays correctly
- [ ] Report saved to database
- [ ] Can view report history

## 📞 Next Steps

Once all checks pass:

1. **Test with real audio**:
   - Record actual speech (not just silence)
   - Test with different audio formats
   - Test with different task types

2. **Performance testing**:
   - Test with longer audio files
   - Monitor memory usage
   - Check response times

3. **Error handling**:
   - Test with invalid audio files
   - Test without auth token
   - Test with missing parameters

4. **Production readiness**:
   - Set up proper logging
   - Configure error monitoring
   - Set up rate limiting
   - Implement caching if needed

## 🎉 Success!

If all checks pass, your AI integration is complete and ready for:
- Development and testing
- Feature additions
- Performance optimization
- Deployment preparation

---

**Checklist Version**: 1.0  
**Last Updated**: June 2024  
**Status**: Ready for Integration Testing
