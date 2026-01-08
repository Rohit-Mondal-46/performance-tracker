const pool = require('../config/database');

/**
 * InputActivity Model
 * Stores 5-minute input activity intervals with keyboard and mouse contribution percentages
 */
class InputActivity {
  /**
   * Create a new input activity interval record
   * @param {Object} inputData - Calculated input activity data for 5-minute window
   * @returns {Object} Created input activity interval record
   */
  static async create(inputData) {
    try {
      const {
        employee_id,
        organization_id,
        interval_start,
        interval_end,
        keyboard_contribution,
        mouse_contribution,
        productive_percentage = 0,
        total_keystrokes = 0,
        total_clicks = 0,
        total_mouse_distance = 0,
        total_scroll_distance = 0
      } = inputData;

      const query = `
        INSERT INTO input_activity_intervals (
          employee_id, organization_id, interval_start, interval_end,
          keyboard_contribution, mouse_contribution, productive_percentage,
          total_keystrokes, total_clicks, total_mouse_distance, total_scroll_distance
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        employee_id, organization_id, interval_start, interval_end,
        keyboard_contribution, mouse_contribution, productive_percentage,
        total_keystrokes, total_clicks, total_mouse_distance, total_scroll_distance
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Input activity interval already exists for this time window');
      }
      console.error('Error creating input activity interval:', error);
      throw new Error('Error creating input activity interval: ' + error.message);
    }
  }

  /**
   * Get input activity intervals for an employee within date range
   * @param {string} employeeId - Employee UUID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Input activity intervals
   */
  static async getByEmployeeDateRange(employeeId, startDate, endDate) {
    try {
      const query = `
        SELECT * FROM input_activity_intervals
        WHERE employee_id = $1
          AND interval_start >= $2
          AND interval_end <= $3
        ORDER BY interval_start ASC
      `;

      const result = await pool.query(query, [employeeId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching input activity intervals:', error);
      throw new Error('Error fetching input activity intervals: ' + error.message);
    }
  }

  /**
   * Get input activity intervals for an organization within date range
   * @param {string} organizationId - Organization UUID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Input activity intervals with employee info
   */
  static async getByOrganizationDateRange(organizationId, startDate, endDate) {
    try {
      const query = `
        SELECT iai.*, e.name as employee_name, e.department, e.position
        FROM input_activity_intervals iai
        JOIN employees e ON iai.employee_id = e.id
        WHERE iai.organization_id = $1
          AND iai.interval_start >= $2
          AND iai.interval_end <= $3
        ORDER BY iai.interval_start ASC
      `;

      const result = await pool.query(query, [organizationId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching organization input activity intervals:', error);
      throw new Error('Error fetching organization input activity intervals: ' + error.message);
    }
  }

  /**
   * Get latest input activity interval for an employee
   * @param {string} employeeId - Employee UUID
   * @returns {Object} Latest input activity interval
   */
  static async getLatestByEmployee(employeeId) {
    try {
      const query = `
        SELECT * FROM input_activity_intervals
        WHERE employee_id = $1
        ORDER BY interval_start DESC
        LIMIT 1
      `;

      const result = await pool.query(query, [employeeId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching latest input activity interval:', error);
      throw new Error('Error fetching latest input activity interval: ' + error.message);
    }
  }

  /**
   * Check if input interval exists
   * @param {string} employeeId - Employee UUID
   * @param {Date} intervalStart - Interval start timestamp
   * @returns {boolean} True if exists
   */
  static async intervalExists(employeeId, intervalStart) {
    try {
      const query = `
        SELECT id FROM input_activity_intervals
        WHERE employee_id = $1 AND interval_start = $2
      `;

      const result = await pool.query(query, [employeeId, intervalStart]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking input interval existence:', error);
      throw new Error('Error checking input interval existence: ' + error.message);
    }
  }

  /**
   * Get aggregated input statistics for an employee for a specific date
   * @param {string} employeeId - Employee UUID
   * @param {Date} date - Date to aggregate
   * @returns {Object} Aggregated input statistics
   */
  static async getAggregatedByEmployeeDate(employeeId, date) {
    try {
      const query = `
        SELECT 
          COUNT(*) as interval_count,
          ROUND(AVG(keyboard_contribution), 2) as avg_keyboard_contribution,
          ROUND(AVG(mouse_contribution), 2) as avg_mouse_contribution,
          SUM(total_keystrokes) as total_keystrokes,
          SUM(total_clicks) as total_clicks,
          SUM(total_mouse_distance) as total_mouse_distance,
          SUM(total_scroll_distance) as total_scroll_distance,
          MIN(interval_start) as first_interval,
          MAX(interval_end) as last_interval
        FROM input_activity_intervals
        WHERE employee_id = $1
          AND DATE(interval_start) = DATE($2)
        GROUP BY employee_id
      `;

      const result = await pool.query(query, [employeeId, date]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting aggregated input statistics:', error);
      throw new Error('Error getting aggregated input statistics: ' + error.message);
    }
  }

  /**
   * Get input activity trends over time for an employee
   * @param {string} employeeId - Employee UUID
   * @param {number} days - Number of days to look back (default: 7)
   * @returns {Array} Daily aggregated trends
   */
  static async getTrendsByEmployee(employeeId, days = 7) {
    try {
      const query = `
        SELECT 
          DATE(interval_start) as date,
          COUNT(*) as interval_count,
          ROUND(AVG(keyboard_contribution), 2) as avg_keyboard_contribution,
          ROUND(AVG(mouse_contribution), 2) as avg_mouse_contribution,
          SUM(total_keystrokes) as total_keystrokes,
          SUM(total_clicks) as total_clicks,
          ROUND(SUM(total_mouse_distance) / 1000.0, 2) as total_mouse_distance_km
        FROM input_activity_intervals
        WHERE employee_id = $1
          AND interval_start >= NOW() - INTERVAL '1 day' * $2
        GROUP BY DATE(interval_start)
        ORDER BY date DESC
      `;

      const result = await pool.query(query, [employeeId, days]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching input activity trends:', error);
      throw new Error('Error fetching input activity trends: ' + error.message);
    }
  }

  /**
   * Get input activity comparison for organization
   * @param {string} organizationId - Organization UUID
   * @param {Date} date - Date to compare
   * @returns {Array} Employee comparison data
   */
  static async getOrganizationComparison(organizationId, date) {
    try {
      const query = `
        SELECT 
          e.id as employee_id,
          e.name as employee_name,
          e.department,
          COUNT(iai.id) as interval_count,
          ROUND(AVG(iai.keyboard_contribution), 2) as avg_keyboard_contribution,
          ROUND(AVG(iai.mouse_contribution), 2) as avg_mouse_contribution,
          SUM(iai.total_keystrokes) as total_keystrokes,
          SUM(iai.total_clicks) as total_clicks
        FROM employees e
        LEFT JOIN input_activity_intervals iai 
          ON e.id = iai.employee_id 
          AND DATE(iai.interval_start) = DATE($2)
        WHERE e.organization_id = $1
        GROUP BY e.id, e.name, e.department
        ORDER BY interval_count DESC, avg_keyboard_contribution DESC
      `;

      const result = await pool.query(query, [organizationId, date]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching organization input comparison:', error);
      throw new Error('Error fetching organization input comparison: ' + error.message);
    }
  }

  /**
   * Delete old input activity intervals (data retention)
   * @param {number} daysToKeep - Number of days to retain
   * @returns {number} Number of deleted records
   */
  static async deleteOldIntervals(daysToKeep = 90) {
    try {
      const query = `
        DELETE FROM input_activity_intervals
        WHERE interval_start < NOW() - INTERVAL '1 day' * $1
        RETURNING id
      `;

      const result = await pool.query(query, [daysToKeep]);
      return result.rows.length;
    } catch (error) {
      console.error('Error deleting old input intervals:', error);
      throw new Error('Error deleting old input intervals: ' + error.message);
    }
  }

  /**
   * Get input activity intervals with corresponding screenshots for employee
   * Matches input intervals (5-min) with screenshots based on timestamp proximity
   * @param {string} employeeId - Employee UUID
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @returns {Array} Input activity intervals with matched screenshots
   */
  static async getWithScreenshotsByEmployee(employeeId, startDate, endDate) {
    try {
      const query = `
        SELECT 
          iai.id,
          iai.interval_start,
          iai.interval_end,
          iai.keyboard_contribution,
          iai.mouse_contribution,
          iai.productive_percentage,
          iai.total_keystrokes,
          iai.total_clicks,
          iai.total_mouse_distance,
          iai.total_scroll_distance,
          iai.created_at,
          ds.id as screenshot_id,
          ds.captured_at as screenshot_captured_at,
          ds.cloudinary_url as screenshot_url,
          ds.cloudinary_public_id as screenshot_public_id
        FROM input_activity_intervals iai
        LEFT JOIN LATERAL (
          SELECT id, captured_at, cloudinary_url, cloudinary_public_id
          FROM daily_screenshots
          WHERE employee_id = iai.employee_id
            AND captured_at >= iai.interval_start
            AND captured_at <= iai.interval_end
          ORDER BY ABS(EXTRACT(EPOCH FROM (captured_at - iai.interval_start)))
          LIMIT 1
        ) ds ON true
        WHERE iai.employee_id = $1
          AND iai.interval_start >= $2
          AND iai.interval_end <= $3
        ORDER BY iai.interval_start DESC
      `;

      const result = await pool.query(query, [employeeId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching input activity with screenshots:', error);
      throw new Error('Error fetching input activity with screenshots: ' + error.message);
    }
  }

  /**
   * Get input activity intervals with screenshots for organization (by employee selection)
   * @param {string} organizationId - Organization UUID
   * @param {string} employeeId - Employee UUID to filter by
   * @param {Date} startDate - Start date for filtering
   * @param {Date} endDate - End date for filtering
   * @returns {Array} Input activity intervals with matched screenshots and employee info
   */
  static async getWithScreenshotsByOrganization(organizationId, employeeId, startDate, endDate) {
    try {
      const query = `
        SELECT 
          iai.id,
          iai.interval_start,
          iai.interval_end,
          iai.keyboard_contribution,
          iai.mouse_contribution,
          iai.productive_percentage,
          iai.total_keystrokes,
          iai.total_clicks,
          iai.total_mouse_distance,
          iai.total_scroll_distance,
          iai.created_at,
          e.name as employee_name,
          e.email as employee_email,
          e.department as employee_department,
          e.position as employee_position,
          ds.id as screenshot_id,
          ds.captured_at as screenshot_captured_at,
          ds.cloudinary_url as screenshot_url,
          ds.cloudinary_public_id as screenshot_public_id
        FROM input_activity_intervals iai
        JOIN employees e ON iai.employee_id = e.id
        LEFT JOIN LATERAL (
          SELECT id, captured_at, cloudinary_url, cloudinary_public_id
          FROM daily_screenshots
          WHERE employee_id = iai.employee_id
            AND captured_at >= iai.interval_start
            AND captured_at <= iai.interval_end
          ORDER BY ABS(EXTRACT(EPOCH FROM (captured_at - iai.interval_start)))
          LIMIT 1
        ) ds ON true
        WHERE iai.organization_id = $1
          AND iai.employee_id = $2
          AND iai.interval_start >= $3
          AND iai.interval_end <= $4
        ORDER BY iai.interval_start DESC
      `;

      const result = await pool.query(query, [organizationId, employeeId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching organization input activity with screenshots:', error);
      throw new Error('Error fetching organization input activity with screenshots: ' + error.message);
    }
  }
}

module.exports = InputActivity;
