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

    // Performance Scores Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS performance_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        working_time INTEGER NOT NULL CHECK (working_time >= 0),
        idle_time INTEGER NOT NULL CHECK (idle_time >= 0),
        absent_time INTEGER NOT NULL CHECK (absent_time >= 0),
        distracted_time INTEGER NOT NULL CHECK (distracted_time >= 0),
        total_time INTEGER NOT NULL CHECK (total_time > 0),
        productivity_score DECIMAL(5,2) NOT NULL CHECK (productivity_score >= 0 AND productivity_score <= 100),
        engagement_score DECIMAL(5,2) NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 100),
        overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
        performance_grade VARCHAR(10) NOT NULL,
        score_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(employee_id, score_date)
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_scores_employee_id ON performance_scores(employee_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_scores_organization_id ON performance_scores(organization_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_scores_date ON performance_scores(score_date);
    `);

    

    // Create demo users for testing
    const bcrypt = require('bcryptjs');
    
    // Create a default admin if none exists
    const adminExists = await pool.query('SELECT id FROM admins WHERE email = $1', ['admin@promonitor.com']);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await pool.query(
        'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)',
        ['System Administrator', 'admin@promonitor.com', hashedPassword]
      );
      
      console.log('✅ Default admin created: admin@promonitor.com / admin123');
    }

    // Create a demo organization if none exists
    const orgExists = await pool.query('SELECT id FROM organizations WHERE email = $1', ['hr@promonitor.com']);
    let orgId;
    if (orgExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('hr123456', 12);
      
      const orgResult = await pool.query(
        'INSERT INTO organizations (name, industry, location, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        ['ProMonitor Corp', 'Technology', 'San Francisco, CA', 'hr@promonitor.com', hashedPassword]
      );
      
      orgId = orgResult.rows[0].id;
      console.log('✅ Demo organization created: hr@promonitor.com / hr123456');
    } else {
      orgId = orgExists.rows[0].id;
    }

    // Create a demo employee if none exists
    const employeeExists = await pool.query('SELECT id FROM employees WHERE email = $1', ['employee@promonitor.com']);
    if (employeeExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('employee123', 12);
      
      await pool.query(
        'INSERT INTO employees (organization_id, name, email, department, position, password) VALUES ($1, $2, $3, $4, $5, $6)',
        [orgId, 'John Employee', 'employee@promonitor.com', 'Engineering', 'Software Developer', hashedPassword]
      );
      
      console.log('✅ Demo employee created: employee@promonitor.com / employee123');
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