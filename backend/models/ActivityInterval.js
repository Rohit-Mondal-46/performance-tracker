const pool = require('../config/database');

/**
 * ActivityInterval Model
 * Stores raw 10-minute activity batches from desktop app
 */
class ActivityInterval {
  /**
   * Create a new activity interval record
   * @param {Object} activityData - Raw activity counts for 10-minute window
   * @returns {Object} Created activity interval record
   */
  static async create(activityData) {
    try {
      const {
        employee_id,
        organization_id,
        interval_start,
        interval_end,
        typing = 0,
        writing = 0,
        reading = 0,
        phone = 0,
        gesturing = 0,
        looking_away = 0,
        idle = 0
      } = activityData;

      const query = `
        INSERT INTO raw_activity_intervals (
          employee_id, organization_id, interval_start, interval_end,
          typing, writing, reading, phone, gesturing, looking_away, idle
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        employee_id, organization_id, interval_start, interval_end,
        typing, writing, reading, phone, gesturing, looking_away, idle
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Activity interval already exists for this time window');
      }
      console.error('Error creating activity interval:', error);
      throw new Error('Error creating activity interval: ' + error.message);
    }
  }

  /**
   * Get activity intervals for an employee within date range
   * @param {string} employeeId - Employee UUID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Activity intervals
   */
  static async getByEmployeeDateRange(employeeId, startDate, endDate) {
    try {
      const query = `
        SELECT * FROM raw_activity_intervals
        WHERE employee_id = $1
          AND interval_start >= $2
          AND interval_end <= $3
        ORDER BY interval_start ASC
      `;

      const result = await pool.query(query, [employeeId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching activity intervals:', error);
      throw new Error('Error fetching activity intervals: ' + error.message);
    }
  }

  /**
   * Get activity intervals for an organization within date range
   * @param {string} organizationId - Organization UUID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Activity intervals
   */
  static async getByOrganizationDateRange(organizationId, startDate, endDate) {
    try {
      const query = `
        SELECT rai.*, e.name as employee_name, e.department, e.position
        FROM raw_activity_intervals rai
        JOIN employees e ON rai.employee_id = e.id
        WHERE rai.organization_id = $1
          AND rai.interval_start >= $2
          AND rai.interval_end <= $3
        ORDER BY rai.interval_start ASC
      `;

      const result = await pool.query(query, [organizationId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching organization activity intervals:', error);
      throw new Error('Error fetching organization activity intervals: ' + error.message);
    }
  }

  /**
   * Get latest activity interval for an employee
   * @param {string} employeeId - Employee UUID
   * @returns {Object} Latest activity interval
   */
  static async getLatestByEmployee(employeeId) {
    try {
      const query = `
        SELECT * FROM raw_activity_intervals
        WHERE employee_id = $1
        ORDER BY interval_start DESC
        LIMIT 1
      `;

      const result = await pool.query(query, [employeeId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching latest activity interval:', error);
      throw new Error('Error fetching latest activity interval: ' + error.message);
    }
  }

  /**
   * Check if interval exists
   * @param {string} employeeId - Employee UUID
   * @param {Date} intervalStart - Interval start timestamp
   * @returns {boolean} True if exists
   */
  static async intervalExists(employeeId, intervalStart) {
    try {
      const query = `
        SELECT id FROM raw_activity_intervals
        WHERE employee_id = $1 AND interval_start = $2
      `;

      const result = await pool.query(query, [employeeId, intervalStart]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking interval existence:', error);
      throw new Error('Error checking interval existence: ' + error.message);
    }
  }

  /**
   * Delete old activity intervals (data retention)
   * @param {number} daysToKeep - Number of days to retain
   * @returns {number} Number of deleted records
   */
  static async deleteOldIntervals(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const query = `
        DELETE FROM raw_activity_intervals
        WHERE interval_start < $1
      `;

      const result = await pool.query(query, [cutoffDate]);
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting old intervals:', error);
      throw new Error('Error deleting old intervals: ' + error.message);
    }
  }
}

module.exports = ActivityInterval;
