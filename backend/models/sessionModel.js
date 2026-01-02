// models/sessionModels.js

const pool = require('../config/database');

const Session = {
  // Create a new session
  create: async () => {
    const result = await pool.query( // FIX: Changed from db.query to pool.query
      'INSERT INTO sessions (start_time, is_active) VALUES (NOW(), true) RETURNING *'
    );
    return result.rows[0];
  },

  // End a session
  end: async (sessionId) => {
    const result = await pool.query( // FIX
      'UPDATE sessions SET end_time = NOW(), is_active = false WHERE id = $1 RETURNING *',
      [sessionId]
    );
    return result.rows[0];
  },

  // Get active session
  getActive: async () => {
    const result = await pool.query( // FIX
      'SELECT * FROM sessions WHERE is_active = true ORDER BY start_time DESC LIMIT 1'
    );
    return result.rows[0];
  },

  // Get session by ID
  getById: async (sessionId) => {
    const result = await pool.query( // FIX
      'SELECT * FROM sessions WHERE id = $1',
      [sessionId]
    );
    return result.rows[0];
  },

  // Get all sessions
  getAll: async (limit = 50, offset = 0) => {
    const result = await pool.query( // FIX
      'SELECT * FROM sessions ORDER BY start_time DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  },

  // Get session duration in seconds
  getDuration: async (sessionId) => {
    const result = await pool.query( // FIX
      `SELECT EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time)) as duration_seconds
       FROM sessions WHERE id = $1`,
      [sessionId]
    );
    return result.rows[0]?.duration_seconds || 0;
  }
};

module.exports = Session;