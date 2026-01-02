const pool = require('./database');

const createTables = async () => {
  try {
    // Admin Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Organization Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        industry VARCHAR(100),
        location VARCHAR(150),
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Employee Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        department VARCHAR(100),
        position VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

     // ========================================================================
    // DETAILED ACTIVITY TRACKING TABLES (Session-based)
    // ========================================================================

    // Sessions Table - The central table for tracking an employee's activity session.
    // Each session is linked to a specific employee.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        end_time TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
    `);

    // Keyboard Events Table - Stores every single keystroke event for a session.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS keyboard_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        key_code INTEGER NOT NULL,
        key_name VARCHAR(50),
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Mouse Events Table - Stores mouse clicks, movements, and scrolls for a session.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mouse_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        event_type VARCHAR(20) NOT NULL, -- e.g., 'click', 'move', 'scroll'
        button INTEGER, -- 1 for left, 2 for right, 3 for middle
        x INTEGER,
        y INTEGER,
        scroll_direction VARCHAR(10), -- 'up', 'down'
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Activity Summaries Table - Stores periodic summaries of user activity for a session.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_summaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        activity_type VARCHAR(50), -- e.g., 'typing', 'reading', 'idle'
        overall_activity DECIMAL(5,2), -- A score from 0-100
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // ========================================================================
    // NEW TABLES FOR ACTIVITY-BASED TRACKING
    // ========================================================================

    // Raw Activity Intervals Table
    // Stores 10-minute activity batches from desktop app
    await pool.query(`
      CREATE TABLE IF NOT EXISTS raw_activity_intervals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        interval_start TIMESTAMP NOT NULL,
        interval_end TIMESTAMP NOT NULL,
        typing INTEGER NOT NULL DEFAULT 0 CHECK (typing >= 0 AND typing <= 600),
        writing INTEGER NOT NULL DEFAULT 0 CHECK (writing >= 0 AND writing <= 600),
        reading INTEGER NOT NULL DEFAULT 0 CHECK (reading >= 0 AND reading <= 600),
        phone INTEGER NOT NULL DEFAULT 0 CHECK (phone >= 0 AND phone <= 600),
        gesturing INTEGER NOT NULL DEFAULT 0 CHECK (gesturing >= 0 AND gesturing <= 600),
        looking_away INTEGER NOT NULL DEFAULT 0 CHECK (looking_away >= 0 AND looking_away <= 600),
        idle INTEGER NOT NULL DEFAULT 0 CHECK (idle >= 0 AND idle <= 600),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(employee_id, interval_start),
        CHECK (interval_end > interval_start),
        CHECK (typing + writing + reading + phone + gesturing + looking_away + idle <= 600)
      );
    `);

    // Calculated Scores Table
    // Stores computed performance metrics aggregated per employee per date
    // ONE record per employee per date (updated when new intervals arrive)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calculated_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        score_date DATE NOT NULL,
        working_total INTEGER NOT NULL CHECK (working_total >= 0),
        distracted_total INTEGER NOT NULL CHECK (distracted_total >= 0),
        idle_total INTEGER NOT NULL CHECK (idle_total >= 0),
        grand_total INTEGER NOT NULL CHECK (grand_total >= 0),
        productivity_score DECIMAL(5,2) NOT NULL CHECK (productivity_score >= 0 AND productivity_score <= 100),
        engagement_score DECIMAL(5,2) NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 100),
        overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
        performance_grade VARCHAR(2) NOT NULL,
        interval_count INTEGER NOT NULL DEFAULT 1 CHECK (interval_count > 0),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(employee_id, score_date)
      );
    `);

      await pool.query(`CREATE TABLE IF NOT EXISTS daily_screenshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        captured_at TIMESTAMP NOT NULL,
        cloudinary_public_id TEXT NOT NULL,
        cloudinary_url TEXT NOT NULL,
        created_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      `);

    // Indexes for Session-based Tracking
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_employee_id ON sessions(employee_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_keyboard_events_session_id ON keyboard_events(session_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_keyboard_events_timestamp ON keyboard_events(timestamp);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_mouse_events_session_id ON mouse_events(session_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_mouse_events_timestamp ON mouse_events(timestamp);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_summaries_session_id ON activity_summaries(session_id);`);


    // Create indexes for raw_activity_intervals
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_raw_activity_employee_id 
      ON raw_activity_intervals(employee_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_raw_activity_organization_id 
      ON raw_activity_intervals(organization_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_raw_activity_interval_start 
      ON raw_activity_intervals(interval_start);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_raw_activity_date 
      ON raw_activity_intervals(DATE(interval_start));
    `);

    // Create indexes for calculated_scores
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_calculated_scores_employee_id 
      ON calculated_scores(employee_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_calculated_scores_organization_id 
      ON calculated_scores(organization_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_calculated_scores_score_date 
      ON calculated_scores(score_date);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_calculated_scores_employee_date 
      ON calculated_scores(employee_id, score_date);
    `);

    // Create a default admin if none exists
    const adminExists = await pool.query('SELECT id FROM admins LIMIT 1');
    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await pool.query(
        'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)',
        ['System Admin', 'admin@performancetracker.com', hashedPassword]
      );
      
      console.log('Default admin created: admin@performancetracker.com / admin123');
    }

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const dropTables = async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS calculated_scores CASCADE;');
    await pool.query('DROP TABLE IF EXISTS raw_activity_intervals CASCADE;');
    await pool.query('DROP TABLE IF EXISTS employees CASCADE;');
    await pool.query('DROP TABLE IF EXISTS organizations CASCADE;');
    await pool.query('DROP TABLE IF EXISTS admins CASCADE;');
    console.log('Database tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
};

module.exports = {
  createTables,
  dropTables
};
