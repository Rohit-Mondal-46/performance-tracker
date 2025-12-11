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
        created_at TIMESTAMP DEFAULT NOW()
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