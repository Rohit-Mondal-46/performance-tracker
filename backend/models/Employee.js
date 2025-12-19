const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Employee {
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        `SELECT e.*, o.name as organization_name 
         FROM employees e 
         LEFT JOIN organizations o ON e.organization_id = o.id 
         WHERE e.email = $1`,
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding employee by email: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT e.id, e.name, e.email, e.department, e.position, e.created_at, e.organization_id, o.name as organization_name 
         FROM employees e 
         LEFT JOIN organizations o ON e.organization_id = o.id 
         WHERE e.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding employee by ID: ${error.message}`);
    }
  }

  static async create(employeeData) {
    const { organization_id, name, email, department, position, password } = employeeData;
    
    try {
      // Check if employee already exists
      const existingEmployee = await this.findByEmail(email);
      if (existingEmployee) {
        throw new Error('Employee with this email already exists');
      }

      // Verify organization exists
      const orgCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [organization_id]);
      if (orgCheck.rows.length === 0) {
        throw new Error('Organization not found');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await pool.query(
        `INSERT INTO employees (organization_id, name, email, department, position, password) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, organization_id, name, email, department, position, created_at`,
        [organization_id, name, email, department, position, hashedPassword]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating employee: ${error.message}`);
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getEmployeesByOrganization(organizationId) {
    try {
      const result = await pool.query(
        `SELECT id, name, email, department, position, created_at 
         FROM employees 
         WHERE organization_id = $1 
         ORDER BY created_at DESC`,
        [organizationId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching employees: ${error.message}`);
    }
  }

  static async getAllEmployees() {
    try {
      const result = await pool.query(
        `SELECT e.id, e.name, e.email, e.department, e.position, e.created_at, e.organization_id, o.name as organization_name 
         FROM employees e 
         LEFT JOIN organizations o ON e.organization_id = o.id 
         ORDER BY e.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching all employees: ${error.message}`);
    }
  }

  static async updateEmployee(id, updateData) {
    const { name, department, position } = updateData;
    
    try {
      const result = await pool.query(
        `UPDATE employees 
         SET name = COALESCE($1, name), 
             department = COALESCE($2, department), 
             position = COALESCE($3, position)
         WHERE id = $4 
         RETURNING id, organization_id, name, email, department, position, created_at`,
        [name, department, position, id]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating employee: ${error.message}`);
    }
  }

  static async deleteEmployee(id) {
    try {
      const result = await pool.query(
        'DELETE FROM employees WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting employee: ${error.message}`);
    }
  }

  static async updatePasswordByEmail(email, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const result = await pool.query(
        'UPDATE employees SET password = $1 WHERE email = $2 RETURNING id, email',
        [hashedPassword, email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  static async setResetToken(email, token, expiry) {
    try {
      const result = await pool.query(
        'UPDATE employees SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3 RETURNING id, email',
        [token, expiry, email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error setting reset token: ${error.message}`);
    }
  }

  static async findByResetToken(token) {
    try {
      const result = await pool.query(
        'SELECT * FROM employees WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [token]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding employee by reset token: ${error.message}`);
    }
  }

  static async clearResetToken(id) {
    try {
      await pool.query(
        'UPDATE employees SET reset_token = NULL, reset_token_expiry = NULL WHERE id = $1',
        [id]
      );
    } catch (error) {
      throw new Error(`Error clearing reset token: ${error.message}`);
    }
  }
}

module.exports = Employee;