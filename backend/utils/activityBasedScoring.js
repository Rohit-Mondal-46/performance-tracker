class ActivityBasedScoring {
  
  static WEIGHTS = {
    // Category weights for overall score
    productivity: 0.55,        // 55% weight on productivity
    engagement: 0.45,          // 45% weight on engagement
    
    // Penalty weights
    idle_penalty: 20,          // Penalty multiplier for idle time
    distracted_penalty: 35,    // Penalty multiplier for distracted time
    
    // Bonus weights
    consistency_bonus: 5       // Bonus for consistent working (>60% work time)
  };

  /**
   * Activity category mappings
   */
  static ACTIVITY_CATEGORIES = {
    working: ['typing', 'writing', 'reading'],
    distracted: ['phone', 'gesturing', 'looking_away'],
    idle: ['idle']
  };

  /**
   * Aggregate raw activity counts into category totals
   * @param {Object} activityData - Raw activity counts from desktop app
   * @returns {Object} Category totals
   */
  static aggregateActivities(activityData) {
    const {
      typing = 0,
      writing = 0,
      reading = 0,
      phone = 0,
      gesturing = 0,
      looking_away = 0,
      idle = 0
    } = activityData;

    // Calculate category totals
    const working_total = typing + writing + reading;
    const distracted_total = phone + gesturing + looking_away;
    const idle_total = idle;
    const grand_total = working_total + distracted_total + idle_total;

    return {
      working_total,
      distracted_total,
      idle_total,
      grand_total
    };
  }

  /**
   * Calculate productivity score (0-100)
   * Rewards working time, penalizes idle time
   * 
   * @param {number} working_total - Total working activity count
   * @param {number} idle_total - Total idle count
   * @param {number} grand_total - Total of all activities
   * @returns {number} Productivity score (0-100)
   */
  static calculateProductivityScore(working_total, idle_total, grand_total) {
    if (grand_total === 0) return 0;

    // Base productivity: proportion of working time
    const working_ratio = working_total / grand_total;
    let productivity_score = working_ratio * 100;

    // Apply idle penalty (less severe than being distracted)
    const idle_ratio = idle_total / grand_total;
    const idle_penalty = idle_ratio * this.WEIGHTS.idle_penalty;
    productivity_score -= idle_penalty;

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(productivity_score * 100) / 100));
  }

  /**
   * Calculate engagement score (0-100)
   * Penalizes distracted activities, rewards consistent focus
   * 
   * @param {number} working_total - Total working activity count
   * @param {number} distracted_total - Total distracted activity count
   * @param {number} grand_total - Total of all activities
   * @returns {number} Engagement score (0-100)
   */
  static calculateEngagementScore(working_total, distracted_total, grand_total) {
    if (grand_total === 0) return 0;

    // Start with perfect engagement
    let engagement_score = 100;

    // Apply distraction penalty (heavy penalty for lack of focus)
    const distraction_ratio = distracted_total / grand_total;
    const distraction_penalty = distraction_ratio * this.WEIGHTS.distracted_penalty;
    engagement_score -= distraction_penalty;

    // Bonus for consistent working (if working time > 60% of total)
    const working_ratio = working_total / grand_total;
    if (working_ratio > 0.6) {
      engagement_score += this.WEIGHTS.consistency_bonus;
    }

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(engagement_score * 100) / 100));
  }

  /**
   * Calculate overall performance score (0-100)
   * Weighted combination of productivity and engagement
   * 
   * @param {number} productivity_score - Productivity score (0-100)
   * @param {number} engagement_score - Engagement score (0-100)
   * @returns {number} Overall score (0-100)
   */
  static calculateOverallScore(productivity_score, engagement_score) {
    const overall_score = (
      productivity_score * this.WEIGHTS.productivity +
      engagement_score * this.WEIGHTS.engagement
    );

    return Math.round(overall_score * 100) / 100;
  }

  /**
   * Determine performance grade based on overall score
   * 
   * @param {number} overall_score - Overall performance score (0-100)
   * @returns {string} Performance grade (A, B, C, D, F)
   */
  static calculatePerformanceGrade(overall_score) {
    if (overall_score >= 90) return 'A';
    if (overall_score >= 80) return 'B';
    if (overall_score >= 70) return 'C';
    if (overall_score >= 60) return 'D';
    return 'F';
  }

  /**
   * Validate activity inputs
   * 
   * @param {Object} activityData - Raw activity counts
   * @returns {Array} Validation errors (empty if valid)
   */
  static validateActivityInputs(activityData) {
    const errors = [];
    const {
      typing = 0,
      writing = 0,
      reading = 0,
      phone = 0,
      gesturing = 0,
      looking_away = 0,
      idle = 0
    } = activityData;

    // Check for negative values
    if (typing < 0) errors.push('Typing count cannot be negative');
    if (writing < 0) errors.push('Writing count cannot be negative');
    if (reading < 0) errors.push('Reading count cannot be negative');
    if (phone < 0) errors.push('Phone count cannot be negative');
    if (gesturing < 0) errors.push('Gesturing count cannot be negative');
    if (looking_away < 0) errors.push('Looking away count cannot be negative');
    if (idle < 0) errors.push('Idle count cannot be negative');

    // Check for reasonable values (10 minutes = 600 seconds max)
    const maxSeconds = 600;
    if (typing > maxSeconds) errors.push('Typing count exceeds 10-minute interval');
    if (writing > maxSeconds) errors.push('Writing count exceeds 10-minute interval');
    if (reading > maxSeconds) errors.push('Reading count exceeds 10-minute interval');
    if (phone > maxSeconds) errors.push('Phone count exceeds 10-minute interval');
    if (gesturing > maxSeconds) errors.push('Gesturing count exceeds 10-minute interval');
    if (looking_away > maxSeconds) errors.push('Looking away count exceeds 10-minute interval');
    if (idle > maxSeconds) errors.push('Idle count exceeds 10-minute interval');

    // Check total doesn't exceed 600 seconds
    const total = typing + writing + reading + phone + gesturing + looking_away + idle;
    if (total > maxSeconds) {
      errors.push(`Total activity count (${total}) exceeds 10-minute interval (${maxSeconds} seconds)`);
    }

    return errors;
  }

  /**
   * Main scoring function - processes activity interval and returns all metrics
   * 
   * @param {Object} activityData - Raw activity counts from desktop app
   * @returns {Object} Complete scoring metrics
   */
  static computeScores(activityData) {
    // Validate inputs
    const validationErrors = this.validateActivityInputs(activityData);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid activity inputs: ${validationErrors.join(', ')}`);
    }

    return this.computeScoresWithoutValidation(activityData);
  }

  /**
   * Compute scores without validation (for daily aggregated data)
   * Use this for daily totals that exceed 10-minute limits
   * 
   * @param {Object} activityData - Activity counts (can be daily aggregates)
   * @returns {Object} Complete scoring metrics
   */
  static computeScoresWithoutValidation(activityData) {
    // Aggregate activities into categories
    const {
      working_total,
      distracted_total,
      idle_total,
      grand_total
    } = this.aggregateActivities(activityData);

    // Handle edge case: no activity data
    if (grand_total === 0) {
      return {
        working_total: 0,
        distracted_total: 0,
        idle_total: 0,
        grand_total: 0,
        productivity_score: 0,
        engagement_score: 0,
        overall_score: 0,
        performance_grade: 'F'
      };
    }

    // Calculate individual scores
    const productivity_score = this.calculateProductivityScore(
      working_total,
      idle_total,
      grand_total
    );

    const engagement_score = this.calculateEngagementScore(
      working_total,
      distracted_total,
      grand_total
    );

    const overall_score = this.calculateOverallScore(
      productivity_score,
      engagement_score
    );

    const performance_grade = this.calculatePerformanceGrade(overall_score);

    return {
      working_total,
      distracted_total,
      idle_total,
      grand_total,
      productivity_score,
      engagement_score,
      overall_score,
      performance_grade
    };
  }

  /**
   * Get performance insights based on scores
   * 
   * @param {Object} scores - Computed scores
   * @returns {Object} Performance insights and recommendations
   */
  static getPerformanceInsights(scores) {
    const {
      working_total,
      distracted_total,
      idle_total,
      grand_total,
      productivity_score,
      engagement_score,
      overall_score
    } = scores;

    const insights = {
      summary: '',
      strengths: [],
      areas_for_improvement: [],
      recommendations: []
    };

    // Generate summary
    if (overall_score >= 90) {
      insights.summary = 'Exceptional performance! Maintaining excellent focus and productivity.';
    } else if (overall_score >= 80) {
      insights.summary = 'Strong performance with good productivity and engagement levels.';
    } else if (overall_score >= 70) {
      insights.summary = 'Satisfactory performance with room for improvement in focus areas.';
    } else if (overall_score >= 60) {
      insights.summary = 'Performance needs attention. Consider strategies to improve focus.';
    } else {
      insights.summary = 'Performance requires significant improvement. Review work patterns.';
    }

    // Identify strengths
    if (productivity_score >= 80) {
      insights.strengths.push('High productivity levels');
    }
    if (engagement_score >= 80) {
      insights.strengths.push('Excellent focus and engagement');
    }
    if (idle_total / grand_total < 0.15) {
      insights.strengths.push('Minimal idle time');
    }

    // Identify areas for improvement
    if (distracted_total / grand_total > 0.2) {
      insights.areas_for_improvement.push('High distraction levels');
      insights.recommendations.push('Minimize phone usage and interruptions during work intervals');
    }
    if (idle_total / grand_total > 0.25) {
      insights.areas_for_improvement.push('Significant idle time');
      insights.recommendations.push('Stay engaged with tasks to reduce idle periods');
    }
    if (working_total / grand_total < 0.5) {
      insights.areas_for_improvement.push('Low productive work time');
      insights.recommendations.push('Focus on increasing time spent on core work activities');
    }

    // General recommendations
    if (overall_score < 80) {
      insights.recommendations.push('Set specific goals for each work interval');
      insights.recommendations.push('Use time-blocking techniques to maintain focus');
    }

    return insights;
  }

  /**
   * Update scoring weights (for tuning)
   * 
   * @param {Object} newWeights - New weight values
   */
  static updateWeights(newWeights) {
    this.WEIGHTS = { ...this.WEIGHTS, ...newWeights };
  }

  /**
   * Get current scoring weights
   * 
   * @returns {Object} Current weights
   */
  static getWeights() {
    return { ...this.WEIGHTS };
  }
}

module.exports = ActivityBasedScoring;
