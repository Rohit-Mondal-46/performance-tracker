const pool = require('./config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createDemoUsers = async () => {
  try {
    console.log('Creating demo users...');

    // Create admin
    const adminExists = await pool.query('SELECT id FROM admins WHERE email = $1', ['admin@promonitor.com']);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await pool.query(
        'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)',
        ['System Administrator', 'admin@promonitor.com', hashedPassword]
      );
      console.log('✅ Admin created: admin@promonitor.com / admin123');
    } else {
      console.log('ℹ️ Admin already exists: admin@promonitor.com');
    }

    // Create organization
    const orgExists = await pool.query('SELECT id FROM organizations WHERE email = $1', ['hr@promonitor.com']);
    let orgId;
    if (orgExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('hr123456', 12);
      const orgResult = await pool.query(
        'INSERT INTO organizations (name, industry, location, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        ['ProMonitor Corp', 'Technology', 'San Francisco, CA', 'hr@promonitor.com', hashedPassword]
      );
      orgId = orgResult.rows[0].id;
      console.log('✅ Organization created: hr@promonitor.com / hr123456');
    } else {
      orgId = orgExists.rows[0].id;
      // Update existing organization password
      const hashedPassword = await bcrypt.hash('hr123456', 12);
      await pool.query(
        'UPDATE organizations SET password = $1 WHERE email = $2',
        [hashedPassword, 'hr@promonitor.com']
      );
      console.log('✅ Organization password updated: hr@promonitor.com / hr123456');
    }

    // Create employee
    const employeeExists = await pool.query('SELECT id FROM employees WHERE email = $1', ['employee@promonitor.com']);
    if (employeeExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('employee123', 12);
      await pool.query(
        'INSERT INTO employees (organization_id, name, email, department, position, password) VALUES ($1, $2, $3, $4, $5, $6)',
        [orgId, 'John Employee', 'employee@promonitor.com', 'Engineering', 'Software Developer', hashedPassword]
      );
      console.log('✅ Employee created: employee@promonitor.com / employee123');
    } else {
      console.log('ℹ️ Employee already exists: employee@promonitor.com');
    }

    console.log('\n🎉 Demo users setup complete!');
    console.log('You can now use these credentials:');
    console.log('- Admin: admin@promonitor.com / admin123');
    console.log('- HR Manager: hr@promonitor.com / hr123456');
    console.log('- Employee: employee@promonitor.com / employee123');

  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await pool.end();
  }
};

createDemoUsers();
