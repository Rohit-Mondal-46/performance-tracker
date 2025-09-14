const pool = require('../config/database');

class PerformanceScore {
  static async create(scoreData) {
    const { 
      employee_id, 
      date, 
      work_time, 
      monitored_time, 
      engaged_frames, 
      total_frames, 
      productivity_score,
      engagement_score,
      final_score,
      score_type = 'daily',
      metadata = {}
    } = scoreData;

    try {
      const result = await pool.query(`
        INSERT INTO performance_scores 
        (employee_id, date, work_time, monitored_time, engaged_frames, total_frames, 
         productivity_score, engagement_score, final_score, score_type, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `, [
        employee_id, date, work_time, monitored_time, engaged_frames, total_frames,
        productivity_score, engagement_score, final_score, score_type, JSON.stringify(metadata)
      ]);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating performance score: ${error.message}`);
    }
  }

  static async getEmployeeScores(employeeId, options = {}) {
    const { 
      startDate, 
      endDate, 
      scoreType = 'daily', 
      limit = 30,
      offset = 0 
    } = options;

    try {
      let query = `
        SELECT * FROM performance_scores 
        WHERE employee_id = $1 AND score_type = $2
      `;
      let params = [employeeId, scoreType];
      let paramCount = 2;

      if (startDate) {
        query += ` AND date >= $${++paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND date <= $${++paramCount}`;
        params.push(endDate);
      }

      query += ` ORDER BY date DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching employee scores: ${error.message}`);
    }
  }

  static async getLatestScore(employeeId, scoreType = 'daily') {
    try {
      const result = await pool.query(`
        SELECT * FROM performance_scores 
        WHERE employee_id = $1 AND score_type = $2 
        ORDER BY date DESC 
        LIMIT 1
      `, [employeeId, scoreType]);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching latest score: ${error.message}`);
    }
  }

  static async getAverageScores(employeeId, days = 30) {
    try {
      const result = await pool.query(`
        SELECT 
          AVG(productivity_score) as avg_productivity,
          AVG(engagement_score) as avg_engagement,
          AVG(final_score) as avg_final_score,
          COUNT(*) as total_days
        FROM performance_scores 
        WHERE employee_id = $1 
          AND score_type = 'daily'
          AND date >= CURRENT_DATE - INTERVAL '${days} days'
      `, [employeeId]);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error calculating average scores: ${error.message}`);
    }
  }

  static calculateScores(activityData, weights = { productivity: 0.8, engagement: 0.2 }) {
    const { workTime, monitoredTime, engagedFrames, totalFrames } = activityData;

    // Calculate productivity score (work time / monitored time * 100)
    const productivityScore = monitoredTime > 0 ? 
      Math.min((workTime / monitoredTime) * 100, 100) : 0;

    // Calculate engagement score (engaged frames / total frames * 100)
    const engagementScore = totalFrames > 0 ? 
      (engagedFrames / totalFrames) * 100 : 0;

    // Calculate final weighted score
    const finalScore = (weights.productivity * productivityScore) + 
                      (weights.engagement * engagementScore);

    return {
      productivityScore: Math.round(productivityScore * 100) / 100,
      engagementScore: Math.round(engagementScore * 100) / 100,
      finalScore: Math.round(finalScore * 100) / 100
    };
  }

  static async generateDailyScore(employeeId, date, activityData, customWeights = null) {
    try {
      const weights = customWeights || { productivity: 0.8, engagement: 0.2 };
      const scores = this.calculateScores(activityData, weights);

      const scoreData = {
        employee_id: employeeId,
        date: date,
        work_time: activityData.workTime,
        monitored_time: activityData.monitoredTime,
        engaged_frames: activityData.engagedFrames,
        total_frames: activityData.totalFrames,
        productivity_score: scores.productivityScore,
        engagement_score: scores.engagementScore,
        final_score: scores.finalScore,
        score_type: 'daily',
        metadata: { weights, raw_data: activityData }
      };

      // Check if score already exists for this date
      const existingScore = await pool.query(`
        SELECT id FROM performance_scores 
        WHERE employee_id = $1 AND date = $2 AND score_type = 'daily'
      `, [employeeId, date]);

      if (existingScore.rows.length > 0) {
        // Update existing score
        const result = await pool.query(`
          UPDATE performance_scores 
          SET work_time = $3, monitored_time = $4, engaged_frames = $5, 
              total_frames = $6, productivity_score = $7, engagement_score = $8, 
              final_score = $9, metadata = $10, updated_at = NOW()
          WHERE employee_id = $1 AND date = $2 AND score_type = 'daily'
          RETURNING *
        `, [
          employeeId, date, activityData.workTime, activityData.monitoredTime,
          activityData.engagedFrames, activityData.totalFrames,
          scores.productivityScore, scores.engagementScore, scores.finalScore,
          JSON.stringify(scoreData.metadata)
        ]);
        
        return result.rows[0];
      } else {
        // Create new score
        return await this.create(scoreData);
      }
    } catch (error) {
      throw new Error(`Error generating daily score: ${error.message}`);
    }
  }
}

module.exports = PerformanceScore;