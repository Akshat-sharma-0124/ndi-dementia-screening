import express from 'express';
import Report from '../models/Report.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all reports for current patient
router.get('/', auth, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ date: 1 }); // Sort chronologically ascending
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
});

// Save a new screening report
router.post('/', auth, async (req, res) => {
  try {
    const {
      id,
      date,
      taskType,
      taskTitle,
      ndiScore,
      status,
      riskLevel,
      localCoherence,
      globalCoherence,
      storyGrammar,
      speechRate,
      averagePause,
      longestPause,
      whyThisScore,
      transcript,
      annotatedWords
    } = req.body;

    // Validate if a report with this id already exists (to prevent duplicate submissions)
    const existing = await Report.findOne({ id });
    if (existing) {
      return res.json(existing); // Return existing instead of error to make processing page idempotent
    }

    const report = new Report({
      user: req.user.id,
      id,
      date,
      taskType,
      taskTitle,
      ndiScore: Number(ndiScore),
      status,
      riskLevel,
      localCoherence: Number(localCoherence),
      globalCoherence: Number(globalCoherence),
      storyGrammar: Number(storyGrammar),
      speechRate: Number(speechRate),
      averagePause: Number(averagePause),
      longestPause: Number(longestPause),
      whyThisScore: whyThisScore || [],
      transcript: transcript || '',
      annotatedWords: annotatedWords || []
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save report', error: error.message });
  }
});

// Get a single report by ID (e.g. rep-001 or rep-new-123)
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findOne({ id: req.params.id, user: req.user.id });
    if (!report) {
      return res.status(404).json({ message: 'Screening report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
});

export default router;
