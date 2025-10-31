
/**
 * Performance Scoring Algorithm:
 * 
 * 1. Productivity Score (40% weight):
 *    - Based on working time vs total time ratio
 *    - Penalty for idle and absent time
 * 
 * 2. Engagement Score (35% weight):
 *    - Based on distracted time penalty
 *    - Rewards consistent working patterns
 * 
 * 3. Efficiency Score (25% weight):
 *    - Based on total productive time utilization
 *    - Considers work-life balance
 */

class PerformanceScoring {
  // Calculate productivity score (0-100)
  static calculateProductivityScore(workingTime, totalTime, idleTime, absentTime) {
    if (totalTime <= 0) return 0;

    // Base productivity ratio
    const workingRatio = workingTime / totalTime;
    let productivityScore = workingRatio * 100;

    // Apply penalties for idle and absent time
    const idleRatio = idleTime / totalTime;
    const absentRatio = absentTime / totalTime;

    // Idle time penalty (less severe than absent time)
    productivityScore -= (idleRatio * 15);

    // Absent time penalty (more severe)
    productivityScore -= (absentRatio * 25);

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, productivityScore));
  }

  // Calculate engagement score (0-100)
  static calculateEngagementScore(workingTime, totalTime, distractedTime) {
    if (totalTime <= 0) return 0;

    // Base engagement is high if working time is substantial
    const workingRatio = workingTime / totalTime;
    let engagementScore = workingRatio * 100;

    // Apply distraction penalty
    const distractionRatio = distractedTime / totalTime;
    
    // Heavy penalty for distraction as it indicates poor focus
    engagementScore -= (distractionRatio * 30);

    // Bonus for consistent working (if working time > 70% of total)
    if (workingRatio > 0.7) {
      engagementScore += 5;
    }

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, engagementScore));
  }

  // Calculate efficiency score (0-100)
  static calculateEfficiencyScore(workingTime, totalTime, idleTime, distractedTime, absentTime) {
    if (totalTime <= 0) return 0;

    // Calculate non-productive time
    const nonProductiveTime = idleTime + distractedTime + absentTime;
    const productiveTime = totalTime - nonProductiveTime;
    
    // Base efficiency
    const efficiencyRatio = productiveTime / totalTime;
    let efficiencyScore = efficiencyRatio * 100;

    // Bonus for optimal work distribution (6-8 hours of work in 8-10 hour period)
    const optimalWorkHours = 8 * 60; // 8 hours in minutes
    const optimalTotalHours = 10 * 60; // 10 hours in minutes

    if (workingTime >= (6 * 60) && workingTime <= optimalWorkHours && 
        totalTime >= (8 * 60) && totalTime <= optimalTotalHours) {
      efficiencyScore += 10;
    }

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, efficiencyScore));
  }

  // Calculate overall performance score with weighted average
  static calculateOverallScore(productivityScore, engagementScore, efficiencyScore) {
    const weights = {
      productivity: 0.4,  // 40%
      engagement: 0.35,   // 35%
      efficiency: 0.25    // 25%
    };

    const overallScore = (
      productivityScore * weights.productivity +
      engagementScore * weights.engagement +
      efficiencyScore * weights.efficiency
    );

    return Math.round(overallScore * 100) / 100; // Round to 2 decimal places
  }

  // Determine performance grade based on overall score
  static calculatePerformanceGrade(overallScore) {
    if (overallScore >= 95) return 'A+';
    if (overallScore >= 90) return 'A';
    if (overallScore >= 80) return 'B';
    if (overallScore >= 70) return 'C';
    if (overallScore >= 60) return 'D';
    return 'F';
  }

  // Validate time inputs
  static validateTimeInputs(workingTime, idleTime, absentTime, distractedTime) {
    const errors = [];

    // Check for negative values
    if (workingTime < 0) errors.push('Working time cannot be negative');
    if (idleTime < 0) errors.push('Idle time cannot be negative');
    if (absentTime < 0) errors.push('Absent time cannot be negative');
    if (distractedTime < 0) errors.push('Distracted time cannot be negative');

    // Check for reasonable values (not more than 24 hours in minutes)
    const maxDailyMinutes = 24 * 60;
    if (workingTime > maxDailyMinutes) errors.push('Working time cannot exceed 24 hours');
    if (idleTime > maxDailyMinutes) errors.push('Idle time cannot exceed 24 hours');
    if (absentTime > maxDailyMinutes) errors.push('Absent time cannot exceed 24 hours');
    if (distractedTime > maxDailyMinutes) errors.push('Distracted time cannot exceed 24 hours');

    return errors;
  }

  // Main scoring function that calculates all scores
  static calculatePerformanceScores(timeMetrics) {
    const { workingTime, idleTime, absentTime, distractedTime } = timeMetrics;

    // Validate inputs
    const validationErrors = this.validateTimeInputs(workingTime, idleTime, absentTime, distractedTime);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid time inputs: ${validationErrors.join(', ')}`);
    }

    // Calculate total time
    const totalTime = workingTime + idleTime + absentTime + distractedTime;

    if (totalTime === 0) {
      throw new Error('Total time cannot be zero');
    }

    // Calculate individual scores
    const productivityScore = this.calculateProductivityScore(workingTime, totalTime, idleTime, absentTime);
    const engagementScore = this.calculateEngagementScore(workingTime, totalTime, distractedTime);
    const efficiencyScore = this.calculateEfficiencyScore(workingTime, totalTime, idleTime, distractedTime, absentTime);

    // Calculate overall score and grade
    const overallScore = this.calculateOverallScore(productivityScore, engagementScore, efficiencyScore);
    const performanceGrade = this.calculatePerformanceGrade(overallScore);

    return {
      totalTime,
      productivityScore: Math.round(productivityScore * 100) / 100,
      engagementScore: Math.round(engagementScore * 100) / 100,
      efficiencyScore: Math.round(efficiencyScore * 100) / 100,
      overallScore,
      performanceGrade,
      breakdown: {
        workingPercentage: Math.round((workingTime / totalTime) * 100),
        idlePercentage: Math.round((idleTime / totalTime) * 100),
        absentPercentage: Math.round((absentTime / totalTime) * 100),
        distractedPercentage: Math.round((distractedTime / totalTime) * 100)
      }
    };
  }

  // Get performance insights based on scores
  static getPerformanceInsights(scores) {
    const insights = [];
    const { productivityScore, engagementScore, efficiencyScore, overallScore, breakdown } = scores;

    // Overall performance insights
    if (overallScore >= 90) {
      insights.push('Excellent overall performance! Keep up the great work.');
    } else if (overallScore >= 80) {
      insights.push('Good performance with room for improvement.');
    } else if (overallScore >= 70) {
      insights.push('Average performance. Consider focusing on key improvement areas.');
    } else {
      insights.push('Performance needs significant improvement. Focus on fundamental work habits.');
    }

    // Specific area insights
    if (productivityScore < 70) {
      insights.push('Low productivity detected. Try to minimize idle and absent time.');
    }

    if (engagementScore < 70) {
      insights.push('Focus issues detected. Consider minimizing distractions during work time.');
    }

    if (breakdown.distractedPercentage > 20) {
      insights.push('High distraction time. Consider using focus techniques or blocking distracting websites.');
    }

    if (breakdown.idlePercentage > 15) {
      insights.push('Significant idle time detected. Consider better time management strategies.');
    }

    if (breakdown.workingPercentage < 60) {
      insights.push('Low working time ratio. Focus on increasing active work periods.');
    }

    // Positive reinforcements
    if (productivityScore >= 85) {
      insights.push('Great productivity levels! Your time management is excellent.');
    }

    if (engagementScore >= 85) {
      insights.push('Excellent focus and engagement. Your concentration skills are strong.');
    }

    return insights;
  }
}

module.exports = PerformanceScoring;