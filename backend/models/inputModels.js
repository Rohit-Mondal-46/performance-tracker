// models/inputModels.js

const pool = require('../config/database');

const Keyboard = {
  // Add a keyboard event
  addEvent: async (sessionId, keyCode, keyName) => {
    const result = await pool.query( // FIX: Changed from db.query to pool.query
      'INSERT INTO keyboard_events (session_id, key_code, key_name) VALUES ($1, $2, $3) RETURNING *',
      [sessionId, keyCode, keyName]
    );
    return result.rows[0];
  },

  // Get recent keyboard events
  getRecentEvents: async (sessionId, limit = 100) => {
    const result = await pool.query( // FIX
      'SELECT * FROM keyboard_events WHERE session_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [sessionId, limit]
    );
    return result.rows;
  },

  // Get keyboard stats for a session
  getStats: async (sessionId) => {
    const result = await pool.query( // FIX
      'SELECT * FROM keyboard_stats WHERE session_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [sessionId]
    );
    return result.rows[0];
  },

  // Update or create keyboard stats
  updateStats: async (sessionId, stats) => {
    const {
      totalKeystrokes,
      keystrokesPerMinute,
      isTyping,
      lastActivity
    } = stats;

    const updateResult = await pool.query( // FIX
      `UPDATE keyboard_stats 
       SET total_keystrokes = $1, keystrokes_per_minute = $2, is_typing = $3, last_activity = $4, updated_at = NOW()
       WHERE session_id = $5
       RETURNING *`,
      [totalKeystrokes, keystrokesPerMinute, isTyping, lastActivity, sessionId]
    );

    if (updateResult.rows.length === 0) {
      const insertResult = await pool.query( // FIX
        `INSERT INTO keyboard_stats 
         (session_id, total_keystrokes, keystrokes_per_minute, is_typing, last_activity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [sessionId, totalKeystrokes, keystrokesPerMinute, isTyping, lastActivity]
      );
      return insertResult.rows[0];
    }

    return updateResult.rows[0];
  },

  // Get top keys for a session
  getTopKeys: async (sessionId, limit = 10) => {
    const result = await pool.query( // FIX
      'SELECT * FROM top_keys WHERE session_id = $1 ORDER BY count DESC LIMIT $2',
      [sessionId, limit]
    );
    return result.rows;
  },

  // Update top keys
  updateTopKey: async (sessionId, keyCode, keyName) => {
    const updateResult = await pool.query( // FIX
      `UPDATE top_keys 
       SET count = count + 1, key_name = $1, updated_at = NOW()
       WHERE session_id = $2 AND key_code = $3
       RETURNING *`,
      [keyName, sessionId, keyCode]
    );

    if (updateResult.rows.length === 0) {
      const insertResult = await pool.query( // FIX
        `INSERT INTO top_keys (session_id, key_code, key_name, count)
         VALUES ($1, $2, $3, 1)
         RETURNING *`,
        [sessionId, keyCode, keyName]
      );
      return insertResult.rows[0];
    }

    return updateResult.rows[0];
  },

  // Get keystrokes in the last minute
  getKeystrokesInLastMinute: async (sessionId) => {
    const result = await pool.query( // FIX
      `SELECT COUNT(*) as count
       FROM keyboard_events
       WHERE session_id = $1 AND timestamp >= NOW() - INTERVAL '1 minute'`,
      [sessionId]
    );
    return parseInt(result.rows[0].count);
  }
};

const Mouse = {
  // Add a mouse event
  addEvent: async (sessionId, eventType, button, x, y, scrollDirection) => {
    const result = await pool.query( // FIX
      `INSERT INTO mouse_events (session_id, event_type, button, x, y, scroll_direction)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [sessionId, eventType, button, x, y, scrollDirection]
    );
    return result.rows[0];
  },

  // Get recent mouse events
  getRecentEvents: async (sessionId, limit = 100) => {
    const result = await pool.query( // FIX
      'SELECT * FROM mouse_events WHERE session_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [sessionId, limit]
    );
    return result.rows;
  },

  // Get mouse stats for a session
  getStats: async (sessionId) => {
    const result = await pool.query( // FIX
      'SELECT * FROM mouse_stats WHERE session_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [sessionId]
    );
    return result.rows[0];
  },

  // Update or create mouse stats
  updateStats: async (sessionId, stats) => {
    const {
      totalClicks,
      totalDistance,
      averageSpeed,
      clicksPerMinute,
      isMoving,
      lastX,
      lastY,
      lastActivity
    } = stats;

    const updateResult = await pool.query( // FIX
      `UPDATE mouse_stats 
       SET total_clicks = $1, total_distance = $2, average_speed = $3, 
           clicks_per_minute = $4, is_moving = $5, last_x = $6, last_y = $7, 
           last_activity = $8, updated_at = NOW()
       WHERE session_id = $9
       RETURNING *`,
      [totalClicks, totalDistance, averageSpeed, clicksPerMinute, isMoving, 
       lastX, lastY, lastActivity, sessionId]
    );

    if (updateResult.rows.length === 0) {
      const insertResult = await pool.query( // FIX
        `INSERT INTO mouse_stats 
         (session_id, total_clicks, total_distance, average_speed, 
          clicks_per_minute, is_moving, last_x, last_y, last_activity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [sessionId, totalClicks, totalDistance, averageSpeed, clicksPerMinute, 
         isMoving, lastX, lastY, lastActivity]
      );
      return insertResult.rows[0];
    }

    return updateResult.rows[0];
  },

  // Get clicks in the last minute
  getClicksInLastMinute: async (sessionId) => {
    const result = await pool.query( // FIX
      `SELECT COUNT(*) as count
       FROM mouse_events
       WHERE session_id = $1 AND event_type = 'click' AND timestamp >= NOW() - INTERVAL '1 minute'`,
      [sessionId]
    );
    return parseInt(result.rows[0].count);
  },

  // Calculate mouse distance between two points
  calculateDistance: (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
};

const Activity = {
  // Add an activity summary
  addSummary: async (sessionId, activityType, overallActivity) => {
    const result = await pool.query( // FIX
      `INSERT INTO activity_summaries (session_id, activity_type, overall_activity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [sessionId, activityType, overallActivity]
    );
    return result.rows[0];
  },

  // Get recent activity summaries
  getRecentSummaries: async (sessionId, limit = 100) => {
    const result = await pool.query( // FIX
      'SELECT * FROM activity_summaries WHERE session_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [sessionId, limit]
    );
    return result.rows;
  },

  // Get activity summary for the last 5 minutes
  getFiveMinuteSummary: async (sessionId) => {
    const result = await pool.query( // FIX
      `SELECT 
         (SELECT COUNT(*) FROM keyboard_events WHERE session_id = $1 AND timestamp >= NOW() - INTERVAL '5 minutes') as keystrokes,
         (SELECT COUNT(*) FROM mouse_events WHERE session_id = $1 AND event_type = 'click' AND timestamp >= NOW() - INTERVAL '5 minutes') as clicks,
         (SELECT AVG(overall_activity) FROM activity_summaries WHERE session_id = $1 AND timestamp >= NOW() - INTERVAL '5 minutes') as avg_activity`,
      [sessionId]
    );
    return result.rows[0];
  }
};

module.exports = {
  Keyboard,
  Mouse,
  Activity
};