const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Organization {
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM organizations WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding organization by email: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT id, name, industry, location, email, created_at FROM organizations WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding organization by ID: ${error.message}`);
    }
  }

  static async create(orgData) {
    const { name, industry, location, email, password } = orgData;
    
    try {
      // Check if organization already exists
      const existingOrg = await this.findByEmail(email);
      if (existingOrg) {
        throw new Error('Organization with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await pool.query(
        `INSERT INTO organizations (name, industry, location, email, password) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, industry, location, email, created_at`,
        [name, industry, location, email, hashedPassword]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating organization: ${error.message}`);
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllOrganizations() {
    try {
      const result = await pool.query(
        'SELECT id, name, industry, location, email, created_at FROM organizations ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching organizations: ${error.message}`);
    }
  }

  static async updateOrganization(id, updateData) {
    const { name, industry, location } = updateData;
    
    try {
      const result = await pool.query(
        `UPDATE organizations 
         SET name = COALESCE($1, name), 
             industry = COALESCE($2, industry), 
             location = COALESCE($3, location)
         WHERE id = $4 
         RETURNING id, name, industry, location, email, created_at`,
        [name, industry, location, id]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating organization: ${error.message}`);
    }
  }

  static async deleteOrganization(id) {
    try {
      const result = await pool.query(
        'DELETE FROM organizations WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting organization: ${error.message}`);
    }
  }
}

module.exports = Organization;
