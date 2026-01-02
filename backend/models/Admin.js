const pool = require('../config/database');
const bcrypt = require('bcryptjs');


class Admin {
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM admins WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding admin by email: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT id, name, email, created_at FROM admins WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding admin by ID: ${error.message}`);
    }
  }

  static async create(adminData) {
    const { name, email, password } = adminData;
    
    try {
      // Check if admin already exists
      const existingAdmin = await this.findByEmail(email);
      if (existingAdmin) {
        throw new Error('Admin with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await pool.query(
        `INSERT INTO admins (name, email, password) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, email, created_at`,
        [name, email, hashedPassword]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating admin: ${error.message}`);
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllAdmins() {
    try {
      const result = await pool.query(
        'SELECT id, name, email, created_at FROM admins ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching admins: ${error.message}`);
    }
  }
}

module.exports = Admin;