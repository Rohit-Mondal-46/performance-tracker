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

    // Performance Scores Table (NEW - ADD THIS)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS performance_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        work_time INTEGER DEFAULT 0,
        monitored_time INTEGER DEFAULT 0,
        engaged_frames INTEGER DEFAULT 0,
        total_frames INTEGER DEFAULT 0,
        productivity_score DECIMAL(5,2) DEFAULT 0,
        engagement_score DECIMAL(5,2) DEFAULT 0,
        final_score DECIMAL(5,2) DEFAULT 0,
        score_type VARCHAR(20) DEFAULT 'daily' CHECK (score_type IN ('daily', 'weekly', 'monthly')),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for performance_scores table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_scores_employee_date 
      ON performance_scores(employee_id, date);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_scores_employee_type 
      ON performance_scores(employee_id, score_type);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_scores_date_type 
      ON performance_scores(date, score_type);
    `);

    // Create unique constraint to prevent duplicate daily scores
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_performance_scores_unique_daily 
      ON performance_scores(employee_id, date, score_type) 
      WHERE score_type = 'daily';
    `);

    // Create trigger function for updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for performance_scores
    await pool.query(`
      DROP TRIGGER IF EXISTS update_performance_scores_updated_at ON performance_scores;
      CREATE TRIGGER update_performance_scores_updated_at 
          BEFORE UPDATE ON performance_scores 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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
    await pool.query('DROP TABLE IF EXISTS performance_scores CASCADE;');
    await pool.query('DROP TABLE IF EXISTS employees CASCADE;');
    await pool.query('DROP TABLE IF EXISTS organizations CASCADE;');
    await pool.query('DROP TABLE IF EXISTS admins CASCADE;');
    await pool.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;');
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