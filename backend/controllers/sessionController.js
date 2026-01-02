// controllers/sessionController.js

const Session = require('../models/sessionModel');
const { Keyboard, Mouse } = require('../models/inputModels'); // Needed for some session operations

// Session Controllers
const sessionController = {
  // Create a new session
  createSession: async (req, res) => {
    try {
      const session = await Session.create();
      res.status(201).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create session',
        error: error.message
      });
    }
  },

  // End a session
  endSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await Session.end(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end session',
        error: error.message
      });
    }
  },

  // Get active session
  getActiveSession: async (req, res) => {
    try {
      const session = await Session.getActive();
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'No active session found'
        });
      }
      
      // Get session duration
      const duration = await Session.getDuration(session.id);
      session.duration = duration;
      
      // Get keyboard and mouse stats
      const keyboardStats = await Keyboard.getStats(session.id);
      const mouseStats = await Mouse.getStats(session.id);
      
      res.status(200).json({
        success: true,
        data: {
          session,
          keyboardStats,
          mouseStats
        }
      });
    } catch (error) {
      console.error('Error getting active session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active session',
        error: error.message
      });
    }
  },

  // Get session by ID
  getSessionById: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await Session.getById(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Get session duration
      const duration = await Session.getDuration(sessionId);
      session.duration = duration;
      
      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get session',
        error: error.message
      });
    }
  },

  // Get all sessions
  getAllSessions: async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const sessions = await Session.getAll(parseInt(limit), parseInt(offset));
      
      res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Error getting sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get sessions',
        error: error.message
      });
    }
  },

  // Reset session data
  resetSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Check if session exists
      const session = await Session.getById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Reset keyboard and mouse stats
      await Keyboard.updateStats(sessionId, {
        totalKeystrokes: 0,
        keystrokesPerMinute: 0,
        isTyping: false,
        lastActivity: null
      });
      
      await Mouse.updateStats(sessionId, {
        totalClicks: 0,
        totalDistance: 0,
        averageSpeed: 0,
        clicksPerMinute: 0,
        isMoving: false,
        lastX: 0,
        lastY: 0,
        lastActivity: null
      });
      
      res.status(200).json({
        success: true,
        message: 'Session data reset successfully'
      });
    } catch (error) {
      console.error('Error resetting session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset session',
        error: error.message
      });
    }
  }
};

module.exports = sessionController;