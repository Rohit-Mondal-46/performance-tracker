/**
 * Input Activity Calculator
 * Calculates keyboard and mouse contribution percentages from raw input data
 */

class InputActivityCalculator {
  /**
   * Calculate activity scores and contribution percentages
   * This is the core calculation engine that processes each 5-minute data batch
   * 
   * @param {Object} rawInputData - Raw input data from desktop app
   * @returns {Object} Calculated contributions and metrics
   */
  static calculateContributions(rawInputData) {
    const {
      keyboard = {},
      mouse = {},
      timestamp
    } = rawInputData;

    // Extract timestamps - support both formats
    const startTime = rawInputData.startTime || rawInputData.interval?.start;
    const endTime = rawInputData.endTime || rawInputData.interval?.end;

    // Extract raw metrics
    const totalKeystrokes = keyboard.totalKeystrokes || 0;
    const totalClicks = mouse.totalClicks || 0;
    const totalMouseDistance = mouse.totalDistance || 0;
    const totalScrollDistance = mouse.scrollDistance || 0;

    // Calculate activity scores based on various metrics
    const keyboardScore = this.calculateKeyboardScore(totalKeystrokes);
    const mouseScore = this.calculateMouseScore(totalClicks, totalMouseDistance, totalScrollDistance);

    // Calculate total activity score
    const totalScore = keyboardScore + mouseScore;

    // Calculate contribution percentages
    let keyboardContribution = 0;
    let mouseContribution = 0;

    if (totalScore > 0) {
      keyboardContribution = (keyboardScore / totalScore) * 100;
      mouseContribution = (mouseScore / totalScore) * 100;
    }

    // Round to 2 decimal places
    keyboardContribution = Math.round(keyboardContribution * 100) / 100;
    mouseContribution = Math.round(mouseContribution * 100) / 100;

    // Calculate productive time percentage
    const intervalDuration = (new Date(endTime) - new Date(startTime)) / 1000; // in seconds
    const productivePercentage = this.calculateProductivePercentage(
      totalKeystrokes,
      totalClicks,
      totalMouseDistance,
      totalScrollDistance,
      intervalDuration
    );

    return {
      keyboard_contribution: keyboardContribution,
      mouse_contribution: mouseContribution,
      productive_percentage: productivePercentage,
      total_keystrokes: totalKeystrokes,
      total_clicks: totalClicks,
      total_mouse_distance: Math.round(totalMouseDistance),
      total_scroll_distance: Math.round(totalScrollDistance),
      interval_start: new Date(startTime),
      interval_end: new Date(endTime),
      raw_scores: {
        keyboard_score: keyboardScore,
        mouse_score: mouseScore,
        total_score: totalScore
      }
    };
  }

  /**
   * Calculate keyboard activity score
   * Score is based on keystroke count with diminishing returns
   * 
   * Scoring logic:
   * - 0-50 keystrokes: 1 point per keystroke (linear)
   * - 51-200 keystrokes: 0.5 points per keystroke (moderate typing)
   * - 201+ keystrokes: 0.25 points per keystroke (heavy typing with diminishing returns)
   * 
   * @param {number} keystrokes - Total keystrokes in interval
   * @returns {number} Calculated keyboard score
   */
  static calculateKeyboardScore(keystrokes) {
    if (keystrokes <= 0) return 0;

    let score = 0;

    // First 50 keystrokes: full points (1:1)
    if (keystrokes <= 50) {
      score = keystrokes;
    } 
    // 51-200 keystrokes: moderate scaling (0.5:1)
    else if (keystrokes <= 200) {
      score = 50 + (keystrokes - 50) * 0.5;
    } 
    // 201+ keystrokes: diminishing returns (0.25:1)
    else {
      score = 50 + (150 * 0.5) + (keystrokes - 200) * 0.25;
    }

    return score;
  }

  /**
   * Calculate productive time percentage
   * Estimates what percentage of the interval the user was actively working
   * 
   * Calculation logic:
   * - Keyboard: Estimate active seconds based on typing patterns
   *   - Each keystroke = ~0.5 seconds of activity (accounting for thinking time)
   *   - Cap at 80% of interval for continuous typing
   * - Mouse: Estimate active seconds based on interactions
   *   - Each click = ~2 seconds of activity (click + decision time)
   *   - Movement: Every 1000 pixels = ~1 second of activity
   *   - Scroll: Every 100 units = ~0.5 seconds of activity
   * - Combine and cap at 100% of interval duration
   * 
   * @param {number} keystrokes - Total keystrokes
   * @param {number} clicks - Total mouse clicks
   * @param {number} mouseDistance - Total mouse distance in pixels
   * @param {number} scrollDistance - Total scroll distance
   * @param {number} intervalDuration - Interval duration in seconds
   * @returns {number} Productive percentage (0-100)
   */
  static calculateProductivePercentage(keystrokes, clicks, mouseDistance, scrollDistance, intervalDuration) {
    if (intervalDuration <= 0) return 0;

    let activeSeconds = 0;

    // Keyboard activity estimation
    // Each keystroke represents about 0.5 seconds of active engagement
    // (includes the actual keystroke plus associated thinking/reading time)
    const keyboardActiveTime = keystrokes * 0.5;
    activeSeconds += keyboardActiveTime;

    // Mouse click activity estimation
    // Each click represents intentional action (~2 seconds including decision time)
    const clickActiveTime = clicks * 2;
    activeSeconds += clickActiveTime;

    // Mouse movement estimation
    // Significant movement indicates user engagement
    // Every 1000 pixels of movement ≈ 1 second of activity
    if (mouseDistance > 100) { // Ignore minimal movements
      const movementActiveTime = mouseDistance / 1000;
      activeSeconds += movementActiveTime;
    }

    // Scroll activity estimation
    // Scrolling indicates content consumption
    // Every 100 units of scroll ≈ 0.5 seconds of reading/engagement
    const scrollActiveTime = Math.abs(scrollDistance) / 200;
    activeSeconds += scrollActiveTime;

    // Cap the active seconds at 95% of interval duration
    // (it's unrealistic to be 100% active every second)
    const maxActiveSeconds = intervalDuration * 0.95;
    activeSeconds = Math.min(activeSeconds, maxActiveSeconds);

    // Calculate percentage
    const productivePercentage = (activeSeconds / intervalDuration) * 100;

    // Round to 2 decimal places and ensure it's between 0-100
    return Math.min(100, Math.max(0, Math.round(productivePercentage * 100) / 100));
  }

  /**
   * Calculate mouse activity score
   * Score is based on clicks, movement distance, and scroll distance
   * 
   * Scoring logic:
   * - Clicks: 2 points per click (clicks are intentional actions)
   * - Mouse distance: 0.01 points per pixel (rewards significant movement)
   * - Scroll distance: 0.05 points per unit (scrolling indicates engagement)
   * 
   * @param {number} clicks - Total mouse clicks
   * @param {number} distance - Total mouse movement distance in pixels
   * @param {number} scrollDistance - Total scroll distance
   * @returns {number} Calculated mouse score
   */
  static calculateMouseScore(clicks, distance, scrollDistance) {
    let score = 0;

    // Clicks are weighted heavily (intentional actions)
    score += clicks * 2;

    // Mouse movement (pixels traveled)
    // Only count significant movement to avoid noise
    if (distance > 100) {
      score += distance * 0.01;
    }

    // Scroll distance (indicates content consumption)
    score += Math.abs(scrollDistance) * 0.05;

    return score;
  }

  /**
   * Validate raw input data before processing
   * @param {Object} rawInputData - Raw input data from desktop app
   * @returns {Array} Array of validation error messages (empty if valid)
   */
  static validateInputData(rawInputData) {
    const errors = [];

    if (!rawInputData) {
      errors.push('Input data is required');
      return errors;
    }

    // Extract timestamps - support both formats
    const startTime = rawInputData.startTime || rawInputData.interval?.start;
    const endTime = rawInputData.endTime || rawInputData.interval?.end;

    // Validate timestamps
    if (!startTime || !endTime) {
      errors.push('startTime/interval.start and endTime/interval.end are required');
    } else {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (isNaN(start.getTime())) {
        errors.push('Invalid startTime format');
      }
      if (isNaN(end.getTime())) {
        errors.push('Invalid endTime format');
      }
      if (end <= start) {
        errors.push('endTime must be after startTime');
      }

      // Check if interval is approximately 5 minutes (with some tolerance)
      // Allow shorter intervals for testing, but warn if too short
      const durationMinutes = (end - start) / (1000 * 60);
      if (durationMinutes > 10) {
        errors.push(`Interval duration is too long: ${durationMinutes.toFixed(2)} minutes (max 10 minutes)`);
      }
      // Only warn for short intervals, don't reject
      if (durationMinutes < 0.1) {
        console.warn(`⚠️ Short interval detected: ${durationMinutes.toFixed(2)} minutes`);
      }
    }

    // Validate keyboard data
    if (rawInputData.keyboard) {
      const { totalKeystrokes } = rawInputData.keyboard;
      if (totalKeystrokes !== undefined && (totalKeystrokes < 0 || !Number.isInteger(totalKeystrokes))) {
        errors.push('totalKeystrokes must be a non-negative integer');
      }
    }

    // Validate mouse data
    if (rawInputData.mouse) {
      const { totalClicks, totalDistance, scrollDistance } = rawInputData.mouse;
      
      if (totalClicks !== undefined && (totalClicks < 0 || !Number.isInteger(totalClicks))) {
        errors.push('totalClicks must be a non-negative integer');
      }
      if (totalDistance !== undefined && totalDistance < 0) {
        errors.push('totalDistance must be non-negative');
      }
      if (scrollDistance !== undefined && typeof scrollDistance !== 'number') {
        errors.push('scrollDistance must be a number');
      }
    }

    return errors;
  }

  /**
   * Get activity level classification based on contributions
   * @param {number} keyboardContribution - Keyboard contribution percentage
   * @param {number} mouseContribution - Mouse contribution percentage
   * @returns {Object} Activity classification
   */
  static classifyActivityLevel(keyboardContribution, mouseContribution) {
    const totalContribution = keyboardContribution + mouseContribution;

    let activityLevel = 'idle';
    let primaryInput = 'none';

    // Determine activity level
    if (totalContribution < 10) {
      activityLevel = 'idle';
    } else if (totalContribution < 30) {
      activityLevel = 'light';
    } else if (totalContribution < 60) {
      activityLevel = 'moderate';
    } else {
      activityLevel = 'active';
    }

    // Determine primary input method
    if (keyboardContribution > mouseContribution * 2) {
      primaryInput = 'keyboard';
    } else if (mouseContribution > keyboardContribution * 2) {
      primaryInput = 'mouse';
    } else if (totalContribution > 10) {
      primaryInput = 'balanced';
    }

    return {
      activity_level: activityLevel,
      primary_input: primaryInput,
      is_active: totalContribution >= 30
    };
  }

  /**
   * Calculate statistics for multiple intervals
   * @param {Array} intervals - Array of input activity interval records
   * @returns {Object} Aggregated statistics
   */
  static aggregateIntervalStats(intervals) {
    if (!intervals || intervals.length === 0) {
      return {
        interval_count: 0,
        avg_keyboard_contribution: 0,
        avg_mouse_contribution: 0,
        total_keystrokes: 0,
        total_clicks: 0,
        total_mouse_distance: 0,
        total_scroll_distance: 0,
        active_intervals: 0,
        activity_distribution: {
          idle: 0,
          light: 0,
          moderate: 0,
          active: 0
        }
      };
    }

    let totalKeyboard = 0;
    let totalMouse = 0;
    let totalKeystrokes = 0;
    let totalClicks = 0;
    let totalMouseDistance = 0;
    let totalScrollDistance = 0;
    let activeIntervals = 0;

    const activityDistribution = {
      idle: 0,
      light: 0,
      moderate: 0,
      active: 0
    };

    intervals.forEach(interval => {
      totalKeyboard += parseFloat(interval.keyboard_contribution) || 0;
      totalMouse += parseFloat(interval.mouse_contribution) || 0;
      totalKeystrokes += parseInt(interval.total_keystrokes) || 0;
      totalClicks += parseInt(interval.total_clicks) || 0;
      totalMouseDistance += parseInt(interval.total_mouse_distance) || 0;
      totalScrollDistance += parseInt(interval.total_scroll_distance) || 0;

      const classification = this.classifyActivityLevel(
        interval.keyboard_contribution,
        interval.mouse_contribution
      );

      if (classification.is_active) {
        activeIntervals++;
      }

      activityDistribution[classification.activity_level]++;
    });

    // Calculate average productive percentage if available
    const totalProductive = intervals.reduce((sum, interval) => {
      return sum + (parseFloat(interval.productive_percentage) || 0);
    }, 0);
    const avgProductivePercentage = intervals.length > 0 
      ? Math.round((totalProductive / intervals.length) * 100) / 100 
      : 0;

    return {
      interval_count: intervals.length,
      avg_keyboard_contribution: Math.round((totalKeyboard / intervals.length) * 100) / 100,
      avg_mouse_contribution: Math.round((totalMouse / intervals.length) * 100) / 100,
      avg_productive_percentage: avgProductivePercentage,
      total_keystrokes: totalKeystrokes,
      total_clicks: totalClicks,
      total_mouse_distance: totalMouseDistance,
      total_scroll_distance: totalScrollDistance,
      active_intervals: activeIntervals,
      active_percentage: Math.round((activeIntervals / intervals.length) * 100 * 100) / 100,
      activity_distribution: activityDistribution
    };
  }
}

module.exports = InputActivityCalculator;
