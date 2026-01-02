const express = require('express');
const sessionController = require('../controllers/sessionController');
const inputController = require('../controllers/inputController');

const router = express.Router();

// Session Routes
// Create a new session
router.post('/sessions', sessionController.createSession);

// End a session
router.put('/sessions/:sessionId/end', sessionController.endSession);

// Get active session
router.get('/sessions/active', sessionController.getActiveSession);

// Get session by ID
router.get('/sessions/:sessionId', sessionController.getSessionById);

// Get all sessions
router.get('/sessions', sessionController.getAllSessions);

// Reset session data
router.put('/sessions/:sessionId/reset', sessionController.resetSession);

// Input Routes - Keyboard
// Record a keyboard event
router.post('/input/keyboard', inputController.recordKeyboardEvent);

// Get keyboard statistics
router.get('/input/keyboard/stats/:sessionId', inputController.getKeyboardStats);

// Input Routes - Mouse
// Record a mouse event
router.post('/input/mouse', inputController.recordMouseEvent);

// Get mouse statistics
router.get('/input/mouse/stats/:sessionId', inputController.getMouseStats);

// Combined Input Routes
// Get detailed statistics
router.get('/input/detailed/:sessionId', inputController.getDetailedStats);

// Update activity data
router.post('/input/activity', inputController.updateActivity);

// Reset input statistics
router.put('/input/:sessionId/reset', inputController.resetInputStats);

module.exports = router;