const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function createDemoUsers() {
  try {
    console.log('Creating demo users...');

    // Create demo admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    await pool.query(`
      INSERT INTO admins (name, email, password) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (email) DO NOTHING
    `, ['Demo Admin', 'admin@demo.com', adminPassword]);

    // Create demo organization
    const orgPassword = await bcrypt.hash('hrmanager123', 12);
    const orgResult = await pool.query(`
      INSERT INTO organizations (name, email, password, industry, location) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO UPDATE SET 
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        industry = EXCLUDED.industry,
        location = EXCLUDED.location
      RETURNING id
    `, ['Demo Organization', 'hr@demo.com', orgPassword, 'Technology', 'Demo City']);

    const orgId = orgResult.rows[0]?.id;

    // Create demo employee
    const empPassword = await bcrypt.hash('employee123', 12);
    await pool.query(`
      INSERT INTO employees (name, email, password, organization_id, department, position) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (email) DO UPDATE SET 
        name = EXCLUDED.name,
        password = EXCLUDED.password,
        department = EXCLUDED.department,
        position = EXCLUDED.position
    `, ['Demo Employee', 'emp@demo.com', empPassword, orgId, 'Development', 'Software Developer']);

    console.log('Demo users created successfully!');
    console.log('Admin: admin@demo.com / admin123');
    console.log('HR Manager: hr@demo.com / hrmanager123');
    console.log('Employee: emp@demo.com / employee123');

  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await pool.end();
  }
}

createDemoUsers();