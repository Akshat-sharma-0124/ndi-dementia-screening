/**
 * AI Integration Utilities
 * Helper functions for NDI analysis, error handling, and feature extraction
 */

import FormData from 'form-data';
import fetch from 'node-fetch';

/**
 * Send audio to NDI Python API for analysis
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} filename - Original filename with extension
 * @param {string} mimeType - Audio MIME type
 * @param {Object} options - Additional options (taskType, taskPrompt, taskTitle)
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeAudio(audioBuffer, filename, mimeType, options = {}) {
  const {
    taskType = 'free-speech',
    taskPrompt = '',
    taskTitle = 'Screening Task'
  } = options;

  const NDI_API_URL = process.env.NDI_API_URL || 'http://localhost:8000';
  const TIMEOUT = 120000; // 2 minutes

  const formData = new FormData();
  formData.append('audio', audioBuffer, { filename, contentType: mimeType });
  formData.append('task_type', taskType);
  formData.append('task_prompt', taskPrompt);
  formData.append('task_title', taskTitle);

  try {
    const response = await fetch(`${NDI_API_URL}/analyze`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
      timeout: TIMEOUT
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`NDI API returned ${response.status}: ${errorData.detail}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      throw new Error('NDI API service is not running. Make sure the Python server is started on port 8000.');
    }
    if (error.message.includes('timeout')) {
      throw new Error('Analysis took too long (>2 minutes). Please try with a shorter audio file.');
    }
    throw error;
  }
}

/**
 * Validate audio file
 * @param {Object} file - Multer file object
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateAudioFile(file) {
  if (!file) {
    return { valid: false, error: 'No audio file provided' };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: `File too large (max ${maxSize / 1024 / 1024}MB)` };
  }

  const supportedMimeTypes = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4'];
  if (!supportedMimeTypes.some(type => file.mimetype.startsWith(type.split('/')[0]))) {
    return { valid: false, error: 'Only audio files are accepted' };
  }

  return { valid: true };
}

/**
 * Format analysis result for database storage
 * @param {Object} analysisResult - Raw result from NDI API
 * @param {string} date - Report date
 * @param {Object} taskInfo - Task info (taskType, taskTitle)
 * @returns {Object} Formatted report object
 */
export function formatReportData(analysisResult, date, taskInfo = {}) {
  return {
    date,
    taskType: taskInfo.taskType || 'free-speech',
    taskTitle: taskInfo.taskTitle || 'Screening Task',
    ndiScore: analysisResult.ndiScore,
    status: analysisResult.status,
    riskLevel: analysisResult.riskLevel,
    localCoherence: analysisResult.localCoherence,
    globalCoherence: analysisResult.globalCoherence,
    storyGrammar: analysisResult.storyGrammar,
    speechRate: analysisResult.speechRate,
    averagePause: analysisResult.averagePause,
    longestPause: analysisResult.longestPause,
    whyThisScore: analysisResult.whyThisScore || [],
    transcript: analysisResult.transcript,
    annotatedWords: analysisResult.annotatedWords || []
  };
}

/**
 * Validate analysis result
 * @param {Object} result - Analysis result to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateAnalysisResult(result) {
  const errors = [];

  const required = ['ndiScore', 'status', 'riskLevel', 'transcript'];
  for (const field of required) {
    if (!(field in result)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (result.ndiScore !== undefined) {
    if (typeof result.ndiScore !== 'number' || result.ndiScore < 0 || result.ndiScore > 100) {
      errors.push('ndiScore must be a number between 0 and 100');
    }
  }

  const validStatuses = ['Mild / Dynamic Variation', 'Moderate Communication Change Detected', 'Significant Narrative Degradation Detected'];
  if (result.status && !validStatuses.includes(result.status)) {
    errors.push(`Invalid status: ${result.status}`);
  }

  const validRisks = ['Low', 'Moderate', 'High'];
  if (result.riskLevel && !validRisks.includes(result.riskLevel)) {
    errors.push(`Invalid risk level: ${result.riskLevel}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if NDI API is reachable
 * @returns {Promise<boolean>}
 */
export async function checkNDIHealth() {
  const NDI_API_URL = process.env.NDI_API_URL || 'http://localhost:8000';
  try {
    const response = await fetch(`${NDI_API_URL}/health`, { timeout: 5000 });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Extract filename extension
 * @param {string} filename - Full filename
 * @returns {string} Extension without dot (e.g., 'webm', 'wav')
 */
export function getAudioExtension(filename) {
  const ext = filename?.split('.')?.pop()?.toLowerCase() || 'webm';
  return ext.split(';')[0]; // Handle MIME type attachments
}

/**
 * Generate report ID
 * @returns {string} Unique report ID (rep-TIMESTAMP)
 */
export function generateReportId() {
  return `rep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create error response object
 * @param {string} message - User-facing message
 * @param {string} hint - Optional hint for resolution
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Error response
 */
export function createErrorResponse(message, hint = '', statusCode = 500) {
  const response = { message };
  if (hint) response.hint = hint;
  return { statusCode, data: response };
}

/**
 * Retry analysis with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Max number of retries
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

export default {
  analyzeAudio,
  validateAudioFile,
  formatReportData,
  validateAnalysisResult,
  checkNDIHealth,
  getAudioExtension,
  generateReportId,
  createErrorResponse,
  retryWithBackoff
};
