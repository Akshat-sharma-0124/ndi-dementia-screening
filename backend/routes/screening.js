import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import {
  analyzeAudio,
  validateAudioFile,
  validateAnalysisResult,
  checkNDIHealth,
  getAudioExtension,
  createErrorResponse
} from '../utils/ai-integration.js';

const router = express.Router();

// Multer — store audio in memory (max 50MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are accepted'), false);
    }
  }
});

/**
 * POST /api/screening/analyze
 * 
 * Analyze audio recording for dementia screening
 * 
 * Request:
 * - audio: (File) Audio file (WebM, WAV, OGG, MP3, M4A)
 * - taskType: (String) Type of task (default: "free-speech")
 * - taskPrompt: (String) Instructions given to patient
 * - taskTitle: (String) Human-readable task name
 * 
 * Response: Analysis result with NDI score and metrics
 */
router.post('/analyze', auth, upload.single('audio'), async (req, res) => {
  try {
    // Validate file presence
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    // Validate audio file
    const fileValidation = validateAudioFile(req.file);
    if (!fileValidation.valid) {
      return res.status(400).json({ message: fileValidation.error });
    }

    // Extract task parameters
    const { 
      taskType = 'free-speech', 
      taskPrompt = '', 
      taskTitle = 'Screening Task' 
    } = req.body;

    // Log request for debugging
    console.log(`[Screening] Analyzing audio for user ${req.user.id}`);
    console.log(`  File: ${req.file.originalname} (${req.file.size} bytes)`);
    console.log(`  Task: ${taskType} - ${taskTitle}`);

    // Send to NDI API
    let analysisResult;
    try {
      const extension = getAudioExtension(req.file.originalname);
      analysisResult = await analyzeAudio(
        req.file.buffer,
        `recording.${extension}`,
        req.file.mimetype,
        { taskType, taskPrompt, taskTitle }
      );
    } catch (aiError) {
      console.error('[Screening] AI service error:', aiError.message);
      
      // Check if it's a connection error
      if (aiError.message.includes('not running')) {
        return res.status(503).json({
          message: 'The AI analysis service is not reachable.',
          hint: 'Ensure the Python NDI server is running: cd ndi_project && uvicorn api_server:app --port 8000'
        });
      }

      // Check if it's a timeout
      if (aiError.message.includes('too long')) {
        return res.status(408).json({
          message: aiError.message,
          hint: 'Try recording a shorter audio clip (under 2 minutes)'
        });
      }

      // Other AI service errors
      return res.status(503).json({
        message: 'AI analysis failed',
        error: aiError.message
      });
    }

    // Validate analysis result
    const resultValidation = validateAnalysisResult(analysisResult);
    if (!resultValidation.valid) {
      console.error('[Screening] Invalid analysis result:', resultValidation.errors);
      return res.status(500).json({
        message: 'Analysis result validation failed',
        errors: resultValidation.errors
      });
    }

    // Log success
    console.log(`[Screening] Analysis complete - NDI Score: ${analysisResult.ndiScore}, Risk: ${analysisResult.riskLevel}`);

    // Return result to client
    res.json(analysisResult);

  } catch (error) {
    console.error('[Screening] Unexpected error:', error);
    res.status(500).json({ 
      message: 'Analysis failed. Please try again.',
      error: error.message 
    });
  }
});

/**
 * GET /api/screening/health
 * Check if NDI API is reachable
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await checkNDIHealth();
    if (isHealthy) {
      res.json({ status: 'healthy', message: 'NDI API is reachable' });
    } else {
      res.status(503).json({ 
        status: 'unhealthy', 
        message: 'NDI API is not reachable',
        hint: 'Start Python server: cd ndi_project && uvicorn api_server:app --port 8000'
      });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

export default router;
