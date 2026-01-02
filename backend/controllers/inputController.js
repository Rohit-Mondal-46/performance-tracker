const Session = require('../models/sessionModel');
const { Keyboard, Mouse, Activity } = require('../models/inputModels');

// Input Controllers
const inputController = {
  // Record a keyboard event
  recordKeyboardEvent: async (req, res) => {
    try {
      const { sessionId, keyCode, keyName } = req.body;
      
      // Validate session
      const session = await Session.getById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Record the event
      const event = await Keyboard.addEvent(sessionId, keyCode, keyName);
      
      // Update top keys
      await Keyboard.updateTopKey(sessionId, keyCode, keyName);
      
      // Get current stats
      const currentStats = await Keyboard.getStats(sessionId) || {
        totalKeystrokes: 0,
        keystrokesPerMinute: 0,
        isTyping: false,
        lastActivity: null
      };
      
      // Calculate keystrokes per minute
      const keystrokesInLastMinute = await Keyboard.getKeystrokesInLastMinute(sessionId);
      
      // Update stats
      const updatedStats = await Keyboard.updateStats(sessionId, {
        totalKeystrokes: currentStats.totalKeystrokes + 1,
        keystrokesPerMinute: keystrokesInLastMinute,
        isTyping: true,
        lastActivity: new Date()
      });
      
      res.status(201).json({
        success: true,
        data: {
          event,
          stats: updatedStats
        }
      });
    } catch (error) {
      console.error('Error recording keyboard event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record keyboard event',
        error: error.message
      });
    }
  },

  // Record a mouse event
  recordMouseEvent: async (req, res) => {
    try {
      const { sessionId, eventType, button, x, y, scrollDirection } = req.body;
      
      // Validate session
      const session = await Session.getById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Record the event
      const event = await Mouse.addEvent(sessionId, eventType, button, x, y, scrollDirection);
      
      // Get current stats
      const currentStats = await Mouse.getStats(sessionId) || {
        totalClicks: 0,
        totalDistance: 0,
        averageSpeed: 0,
        clicksPerMinute: 0,
        isMoving: false,
        lastX: 0,
        lastY: 0,
        lastActivity: null
      };
      
      let updatedStats = currentStats;
      
      // Handle different event types
      if (eventType === 'click') {
        // Calculate clicks per minute
        const clicksInLastMinute = await Mouse.getClicksInLastMinute(sessionId);
        
        // Update stats
        updatedStats = await Mouse.updateStats(sessionId, {
          ...currentStats,
          totalClicks: currentStats.totalClicks + 1,
          clicksPerMinute: clicksInLastMinute,
          lastX: x,
          lastY: y,
          lastActivity: new Date()
        });
      } else if (eventType === 'move') {
        // Calculate distance from last position
        const distance = Mouse.calculateDistance(
          currentStats.lastX || x, 
          currentStats.lastY || y, 
          x, 
          y
        );
        
        // Update stats
        updatedStats = await Mouse.updateStats(sessionId, {
          ...currentStats,
          totalDistance: currentStats.totalDistance + distance,
          isMoving: true,
          lastX: x,
          lastY: y,
          lastActivity: new Date()
        });
      } else if (eventType === 'scroll') {
        // Update stats for scroll
        updatedStats = await Mouse.updateStats(sessionId, {
          ...currentStats,
          isMoving: true,
          lastX: x,
          lastY: y,
          lastActivity: new Date()
        });
      }
      
      res.status(201).json({
        success: true,
        data: {
          event,
          stats: updatedStats
        }
      });
    } catch (error) {
      console.error('Error recording mouse event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record mouse event',
        error: error.message
      });
    }
  },

  // Get keyboard statistics
  getKeyboardStats: async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Validate session
      const session = await Session.getById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Get stats
      const stats = await Keyboard.getStats(sessionId);
      
      // Get top keys
      const topKeys = await Keyboard.getTopKeys(sessionId);
      
      res.status(200).json({
        success: true,
        data: {
          stats,
          topKeys
        }
      });
    } catch (error) {
      console.error('Error getting keyboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get keyboard stats',
        error: error.message
      });
    }
  },

  // Get mouse statistics
  getMouseStats: async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Validate session
      const session = await Session.getById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Get stats
      const stats = await Mouse.getStats(sessionId);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting mouse stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get mouse stats',
        error: error.message
      });
    }
  },

  // Get detailed statistics
  getDetailedStats: async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Validate session
      const session = await Session.getById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Get keyboard and mouse stats
      const keyboardStats = await Keyboard.getStats(sessionId);
      const mouseStats = await Mouse.getStats(sessionId);
      const topKeys = await Keyboard.getTopKeys(sessionId);
      
      // Get recent events
      const recentKeyboardEvents = await Keyboard.getRecentEvents(sessionId, 50);
      const recentMouseEvents = await Mouse.getRecentEvents(sessionId, 50);
      
      // Get activity summary
      const activitySummary = await Activity.getFiveMinuteSummary(sessionId);
      
      res.status(200).json({
        success: true,
        data: {
          session,
          keyboard: {
            stats: keyboardStats,
            topKeys,
            recentEvents: recentKeyboardEvents
          },
          mouse: {
            stats: mouseStats,
            recentEvents: recentMouseEvents
          },
          activity: activitySummary
        }
      });
    } catch (error) {
      console.error('Error getting detailed stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get detailed stats',
        error: error.message
      });
    }
  },

  // Update activity data
  updateActivity: async (req, res) => {
    try {
      const { sessionId, activityType, overallActivity } = req.body;
      
      // Validate session
      const session = await Session.getById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Add activity summary
      const summary = await Activity.addSummary(sessionId, activityType, overallActivity);
      
      res.status(201).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update activity',
        error: error.message
      });
    }
  },

  // Reset all input statistics for a session
  resetInputStats: async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Validate session
      const session = await Session.getById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Reset keyboard stats
      await Keyboard.updateStats(sessionId, {
        totalKeystrokes: 0,
        keystrokesPerMinute: 0,
        isTyping: false,
        lastActivity: null
      });
      
      // Reset mouse stats
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
        message: 'Input statistics reset successfully'
      });
    } catch (error) {
      console.error('Error resetting input stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset input statistics',
        error: error.message
      });
    }
  }
};

module.exports = inputController;