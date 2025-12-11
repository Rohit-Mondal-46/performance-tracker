const pool = require('../config/database');

/**
 * CalculatedScore Model
 * Stores computed performance metrics aggregated per employee per date
 * ONE record per employee per date (updated when new intervals arrive)
 */
class CalculatedScore {
  /**
   * Get all activity intervals for a specific employee and date
   * @param {string} employeeId - Employee UUID
   * @param {Date} date - Target date
   * @returns {Array} Activity intervals for that date
   */
  static async getIntervalsForDate(employeeId, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const query = `
        SELECT * FROM raw_activity_intervals
        WHERE employee_id = $1
          AND interval_start >= $2
          AND interval_start <= $3
        ORDER BY interval_start ASC
      `;

      const result = await pool.query(query, [employeeId, startOfDay, endOfDay]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching intervals for date:', error);
      throw new Error('Error fetching intervals for date: ' + error.message);
    }
  }

  /**
   * Aggregate all intervals for a specific date into daily totals
   * @param {Array} intervals - Array of raw activity intervals
   * @returns {Object} Aggregated activity totals for the day
   */
  static aggregateIntervalsForDay(intervals) {
    if (!intervals || intervals.length === 0) {
      return {
        typing: 0,
        writing: 0,
        reading: 0,
        phone: 0,
        gesturing: 0,
        looking_away: 0,
        idle: 0,
        interval_count: 0
      };
    }

    const totals = intervals.reduce((acc, interval) => {
      acc.typing += interval.typing || 0;
      acc.writing += interval.writing || 0;
      acc.reading += interval.reading || 0;
      acc.phone += interval.phone || 0;
      acc.gesturing += interval.gesturing || 0;
      acc.looking_away += interval.looking_away || 0;
      acc.idle += interval.idle || 0;
      return acc;
    }, {
      typing: 0,
      writing: 0,
      reading: 0,
      phone: 0,
      gesturing: 0,
      looking_away: 0,
      idle: 0
    });

    return {
      ...totals,
      interval_count: intervals.length
    };
  }

  /**
   * Upsert daily calculated score (INSERT new or UPDATE existing)
   * @param {Object} scoreData - Daily aggregated scores
   * @returns {Object} Upserted calculated score record
   */
  static async upsertDailyScore(scoreData) {
    try {
      const {
        employee_id,
        organization_id,
        score_date,
        working_total,
        distracted_total,
        idle_total,
        grand_total,
        productivity_score,
        engagement_score,
        overall_score,
        performance_grade,
        interval_count
      } = scoreData;

      const query = `
        INSERT INTO calculated_scores (
          employee_id, organization_id, score_date,
          working_total, distracted_total, idle_total, grand_total,
          productivity_score, engagement_score, overall_score, performance_grade,
          interval_count, updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        ON CONFLICT (employee_id, score_date)
        DO UPDATE SET
          working_total = EXCLUDED.working_total,
          distracted_total = EXCLUDED.distracted_total,
          idle_total = EXCLUDED.idle_total,
          grand_total = EXCLUDED.grand_total,
          productivity_score = EXCLUDED.productivity_score,
          engagement_score = EXCLUDED.engagement_score,
          overall_score = EXCLUDED.overall_score,
          performance_grade = EXCLUDED.performance_grade,
          interval_count = EXCLUDED.interval_count,
          updated_at = NOW()
        RETURNING *
      `;

      const values = [
        employee_id, organization_id, score_date,
        working_total, distracted_total, idle_total, grand_total,
        productivity_score, engagement_score, overall_score, performance_grade,
        interval_count
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error upserting daily score:', error);
      throw new Error('Error upserting daily score: ' + error.message);
    }
  }

  /**
   * Get calculated score for a specific employee and date
   * @param {string} employeeId - Employee UUID
   * @param {Date} date - Target date
   * @returns {Object} Calculated score for that date
   */
  static async getByEmployeeAndDate(employeeId, date) {
    try {
      const query = `
        SELECT * FROM calculated_scores
        WHERE employee_id = $1
          AND score_date = $2
      `;

      const result = await pool.query(query, [employeeId, date]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching score by employee and date:', error);
      throw new Error('Error fetching score by employee and date: ' + error.message);
    }
  }

  /**
   * Get calculated scores for an employee within date range
   * @param {string} employeeId - Employee UUID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Daily calculated scores
   */
  static async getByEmployeeDateRange(employeeId, startDate, endDate) {
    try {
      const query = `
        SELECT *
        FROM calculated_scores
        WHERE employee_id = $1
          AND score_date >= $2
          AND score_date <= $3
        ORDER BY score_date ASC
      `;

      const result = await pool.query(query, [employeeId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching calculated scores:', error);
      throw new Error('Error fetching calculated scores: ' + error.message);
    }
  }

  /**
   * Get aggregated daily scores for an employee
   * @param {string} employeeId - Employee UUID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Daily aggregated scores
   */
  static async getDailyAggregatedScores(employeeId, startDate, endDate) {
    try {
      const query = `
        SELECT 
          score_date,
          working_total as total_working,
          distracted_total as total_distracted,
          idle_total as total_idle,
          grand_total as total_time,
          productivity_score as avg_productivity_score,
          engagement_score as avg_engagement_score,
          overall_score as avg_overall_score,
          interval_count,
          performance_grade
        FROM calculated_scores
        WHERE employee_id = $1
          AND score_date >= $2
          AND score_date <= $3
        ORDER BY score_date DESC
      `;

      const result = await pool.query(query, [employeeId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching daily aggregated scores:', error);
      throw new Error('Error fetching daily aggregated scores: ' + error.message);
    }
  }

  /**
   * Get aggregated scores for an organization
   * @param {string} organizationId - Organization UUID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Organization aggregated scores by employee
   */
  static async getOrganizationAggregatedScores(organizationId, startDate, endDate) {
    try {
      const query = `
        SELECT 
          cs.employee_id,
          e.name as employee_name,
          e.department,
          e.position,
          cs.score_date,
          cs.working_total as total_working,
          cs.distracted_total as total_distracted,
          cs.idle_total as total_idle,
          cs.grand_total as total_time,
          cs.productivity_score as avg_productivity_score,
          cs.engagement_score as avg_engagement_score,
          cs.overall_score as avg_overall_score,
          cs.interval_count,
          cs.performance_grade
        FROM calculated_scores cs
        JOIN employees e ON cs.employee_id = e.id
        WHERE cs.organization_id = $1
          AND cs.score_date >= $2
          AND cs.score_date <= $3
        ORDER BY cs.score_date DESC, cs.overall_score DESC
      `;

      const result = await pool.query(query, [organizationId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching organization aggregated scores:', error);
      throw new Error('Error fetching organization aggregated scores: ' + error.message);
    }
  }



  /**
   * Get performance trends for an employee (last N days)
   * @param {string} employeeId - Employee UUID
   * @param {number} days - Number of days to look back
   * @returns {Object} Performance trends
   */
  static async getPerformanceTrends(employeeId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const query = `
        SELECT 
          score_date as date,
          productivity_score as avg_productivity,
          engagement_score as avg_engagement,
          overall_score as avg_overall,
          working_total as total_working,
          distracted_total as total_distracted,
          idle_total as total_idle,
          interval_count
        FROM calculated_scores
        WHERE employee_id = $1
          AND score_date >= $2
        ORDER BY score_date ASC
      `;

      const result = await pool.query(query, [employeeId, startDate]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching performance trends:', error);
      throw new Error('Error fetching performance trends: ' + error.message);
    }
  }

  /**
   * Delete old calculated scores (data retention)
   * @param {number} daysToKeep - Number of days to retain
   * @returns {number} Number of deleted records
   */
  static async deleteOldScores(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const query = `
        DELETE FROM calculated_scores
        WHERE score_date < $1
      `;

      const result = await pool.query(query, [cutoffDate]);
      return result.rowCount;
    } catch (error) {
      console.error('Error deleting old scores:', error);
      throw new Error('Error deleting old scores: ' + error.message);
    }
  }
}

module.exports = CalculatedScore;
