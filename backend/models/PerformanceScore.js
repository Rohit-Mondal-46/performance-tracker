const pool = require('../config/database');

class PerformanceScore {
  // Create a new performance score
  static async create(scoreData) {
    try {
      const {
        employee_id,
        organization_id,
        working_time,
        idle_time,
        absent_time,
        distracted_time,
        total_time,
        productivity_score,
        engagement_score,
        overall_score,
        performance_grade,
        score_date
      } = scoreData;

      const query = `
        INSERT INTO performance_scores (
          employee_id, organization_id, working_time, idle_time, absent_time, 
          distracted_time, total_time, productivity_score, engagement_score, 
          overall_score, performance_grade, score_date
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        employee_id, organization_id, working_time, idle_time, absent_time,
        distracted_time, total_time, productivity_score, engagement_score,
        overall_score, performance_grade, score_date
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Performance score for this employee on this date already exists');
      }
      console.error('Error creating performance score:', error);
      throw new Error('Error creating performance score: ' + error.message);
    }
  }

  // Find performance score by ID
  static async findById(id) {
    try {
      const query = `
        SELECT ps.*, e.name as employee_name, e.department, e.position,
               o.name as organization_name
        FROM performance_scores ps
        JOIN employees e ON ps.employee_id = e.id
        JOIN organizations o ON ps.organization_id = o.id
        WHERE ps.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding performance score by ID:', error);
      throw new Error('Error finding performance score: ' + error.message);
    }
  }

  // Get performance scores by employee
  static async getByEmployee(employeeId, limit = 30) {
    try {
      console.log('Debug - getByEmployee called with employeeId:', employeeId, 'limit:', limit);
      
      const query = `
        SELECT ps.*, e.name as employee_name, e.department, e.position,
        o.name as organization_name
        FROM performance_scores ps
        JOIN employees e ON ps.employee_id = e.id
        JOIN organizations o ON ps.organization_id = o.id
        WHERE ps.employee_id = $1
        ORDER BY ps.score_date DESC, ps.created_at DESC
        LIMIT $2
      `;
      
      console.log('Debug - Executing query with params:', [employeeId, limit]);
      
      const result = await pool.query(query, [employeeId, limit]);
      
      console.log('Debug - Query result rows:', result.rows.length);
      console.log('Debug - First row:', result.rows[0]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting performance scores by employee:', error);
      throw new Error('Error retrieving employee performance scores: ' + error.message);
    }
  }

  // Get performance scores by organization
  static async getByOrganization(organizationId, limit = 100) {
    try {
      const query = `
        SELECT ps.*, e.name as employee_name, e.department, e.position,
               o.name as organization_name
        FROM performance_scores ps
        JOIN employees e ON ps.employee_id = e.id
        JOIN organizations o ON ps.organization_id = o.id
        WHERE ps.organization_id = $1
        ORDER BY ps.score_date DESC, ps.created_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [organizationId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting performance scores by organization:', error);
      throw new Error('Error retrieving organization performance scores: ' + error.message);
    }
  }

  // Get performance scores by date range
  static async getByDateRange(employeeId, startDate, endDate) {
    try {
      const query = `
        SELECT ps.*, e.name as employee_name, e.department, e.position,
               o.name as organization_name
        FROM performance_scores ps
        JOIN employees e ON ps.employee_id = e.id
        JOIN organizations o ON ps.organization_id = o.id
        WHERE ps.employee_id = $1 
        AND ps.score_date >= $2 
        AND ps.score_date <= $3
        ORDER BY ps.score_date DESC
      `;
      
      const result = await pool.query(query, [employeeId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error getting performance scores by date range:', error);
      throw new Error('Error retrieving performance scores by date range: ' + error.message);
    }
  }



  // Get performance analytics for organization
  static async getOrganizationAnalytics(organizationId, days = 30) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_scores,
          AVG(overall_score) as average_score,
          AVG(productivity_score) as average_productivity,
          AVG(engagement_score) as average_engagement,
          AVG(working_time) as average_working_time,
          AVG(idle_time + distracted_time) as average_unproductive_time,
          COUNT(CASE WHEN performance_grade = 'A+' THEN 1 END) as grade_a_plus,
          COUNT(CASE WHEN performance_grade = 'A' THEN 1 END) as grade_a,
          COUNT(CASE WHEN performance_grade = 'B' THEN 1 END) as grade_b,
          COUNT(CASE WHEN performance_grade = 'C' THEN 1 END) as grade_c,
          COUNT(CASE WHEN performance_grade = 'D' THEN 1 END) as grade_d,
          COUNT(CASE WHEN performance_grade = 'F' THEN 1 END) as grade_f
        FROM performance_scores 
        WHERE organization_id = $1 
        AND score_date >= CURRENT_DATE - INTERVAL '%s days'
      `;
      
      const result = await pool.query(query.replace('%s', days), [organizationId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting organization analytics:', error);
      throw new Error('Error retrieving organization analytics: ' + error.message);
    }
  }

  // Get employee performance trends
  static async getEmployeeTrends(employeeId, days = 30) {
    try {
      const query = `
        SELECT 
          score_date,
          overall_score,
          productivity_score,
          engagement_score,
          performance_grade,
          working_time,
          idle_time + distracted_time as unproductive_time
        FROM performance_scores 
        WHERE employee_id = $1 
        AND score_date >= CURRENT_DATE - INTERVAL '%s days'
        ORDER BY score_date ASC
      `;
      
      const result = await pool.query(query.replace('%s', days), [employeeId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting employee trends:', error);
      throw new Error('Error retrieving employee trends: ' + error.message);
    }
  }

  // Check if score exists for employee on date
  static async scoreExistsForDate(employeeId, scoreDate) {
    try {
      const query = `
        SELECT id FROM performance_scores 
        WHERE employee_id = $1 AND score_date = $2
      `;
      
      const result = await pool.query(query, [employeeId, scoreDate]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking score existence:', error);
      throw new Error('Error checking score existence: ' + error.message);
    }
  }
}

module.exports = PerformanceScore;