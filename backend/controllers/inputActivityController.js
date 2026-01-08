const InputActivity = require('../models/InputActivity');
const InputActivityCalculator = require('../utils/inputActivityCalculator');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/helpers');

/**
 * Input Activity Controller
 * Handles ingestion and retrieval of input activity data
 */

/**
 * Ingest 5-minute input activity batch
 * This is the main endpoint that receives data from the desktop app
 * Calculates keyboard/mouse contributions and stores only the percentages
 * 
 * @route POST /api/input-activity/ingest
 */

const ingestInputActivity = async (req, res) => {
  try {
    console.log('📥 Received keyboard and mouse activity data:', JSON.stringify(req.body, null, 2));

    const rawInputData = req.body;

    // Get employee info from authenticated user
    const employeeId = req.user.id;
    const organizationId = req.user.organizationId;

    // STEP 1: Validate incoming data
    const validationErrors = InputActivityCalculator.validateInputData(rawInputData);
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json(
        formatErrorResponse(`Invalid input data: ${validationErrors.join(', ')}`, 400)
      );
    }

    console.log('✅ Validation passed');

    // STEP 2: Calculate contributions using the calculation engine
    const calculatedData = InputActivityCalculator.calculateContributions(rawInputData);
    
    console.log('🧮 Calculated contributions:', {
      keyboard: calculatedData.keyboard_contribution + '%',
      mouse: calculatedData.mouse_contribution + '%',
      keystrokes: calculatedData.total_keystrokes,
      clicks: calculatedData.total_clicks
    });

    // STEP 3: Check if interval already exists (prevent duplicates)
    const exists = await InputActivity.intervalExists(employeeId, calculatedData.interval_start);
    if (exists) {
      return res.status(409).json(
        formatErrorResponse('Input activity interval already exists for this time window', 409)
      );
    }

    // STEP 4: Prepare data for storage
    const inputActivityData = {
      employee_id: employeeId,
      organization_id: organizationId,
      interval_start: calculatedData.interval_start,
      interval_end: calculatedData.interval_end,
      keyboard_contribution: calculatedData.keyboard_contribution,
      mouse_contribution: calculatedData.mouse_contribution,
      productive_percentage: calculatedData.productive_percentage,
      total_keystrokes: calculatedData.total_keystrokes,
      total_clicks: calculatedData.total_clicks,
      total_mouse_distance: calculatedData.total_mouse_distance,
      total_scroll_distance: calculatedData.total_scroll_distance
    };

    // STEP 5: Store in database
    const savedRecord = await InputActivity.create(inputActivityData);

    console.log('✅ Input activity interval saved:', savedRecord.id);

    // STEP 6: Get activity classification
    const classification = InputActivityCalculator.classifyActivityLevel(
      calculatedData.keyboard_contribution,
      calculatedData.mouse_contribution
    );

    return res.status(201).json(
      formatSuccessResponse({
        message: 'Input activity data ingested successfully',
        interval: {
          id: savedRecord.id,
          interval_start: savedRecord.interval_start,
          interval_end: savedRecord.interval_end,
          keyboard_contribution: savedRecord.keyboard_contribution,
          mouse_contribution: savedRecord.mouse_contribution,
          productive_percentage: savedRecord.productive_percentage,
          classification: classification
        }
      }, 201)
    );

  } catch (error) {
    console.error('❌ Error ingesting input activity:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to ingest input activity data: ' + error.message, 500)
    );
  }
};

/**
 * Get my input activity intervals for a date range
 * 
 * @route GET /api/input-activity/intervals?start_date=2024-01-01&end_date=2024-01-31
 */
const getMyInputIntervals = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { start_date, end_date } = req.query;

    // Default to today if no dates provided
    const startDate = start_date ? new Date(start_date) : new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = end_date ? new Date(end_date) : new Date(new Date().setHours(23, 59, 59, 999));

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json(
        formatErrorResponse('Invalid date format', 400)
      );
    }

    const intervals = await InputActivity.getByEmployeeDateRange(employeeId, startDate, endDate);

    return res.status(200).json(
      formatSuccessResponse({
        intervals: intervals,
        count: intervals.length,
        date_range: {
          start: startDate,
          end: endDate
        }
      })
    );

  } catch (error) {
    console.error('Error fetching input intervals:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to fetch input intervals: ' + error.message, 500)
    );
  }
};

/**
 * Get my aggregated input statistics for a specific date
 * 
 * @route GET /api/input-activity/daily-stats?date=2024-01-15
 */
const getMyDailyInputStats = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { date } = req.query;

    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();

    if (isNaN(targetDate.getTime())) {
      return res.status(400).json(
        formatErrorResponse('Invalid date format', 400)
      );
    }

    const stats = await InputActivity.getAggregatedByEmployeeDate(employeeId, targetDate);

    if (!stats) {
      return res.status(200).json(
        formatSuccessResponse({
          message: 'No input activity data found for this date',
          date: targetDate,
          stats: null
        })
      );
    }

    return res.status(200).json(
      formatSuccessResponse({
        date: targetDate,
        stats: stats
      })
    );

  } catch (error) {
    console.error('Error fetching daily input stats:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to fetch daily input stats: ' + error.message, 500)
    );
  }
};

/**
 * Get my input activity trends over time
 * 
 * @route GET /api/input-activity/trends?days=7
 */
const getMyInputTrends = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const days = parseInt(req.query.days) || 7;

    if (days < 1 || days > 90) {
      return res.status(400).json(
        formatErrorResponse('Days must be between 1 and 90', 400)
      );
    }

    const trends = await InputActivity.getTrendsByEmployee(employeeId, days);

    return res.status(200).json(
      formatSuccessResponse({
        trends: trends,
        days: days
      })
    );

  } catch (error) {
    console.error('Error fetching input trends:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to fetch input trends: ' + error.message, 500)
    );
  }
};

/**
 * Get my latest input activity
 * 
 * @route GET /api/input-activity/latest
 */
const getMyLatestInput = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const latestInterval = await InputActivity.getLatestByEmployee(employeeId);

    if (!latestInterval) {
      return res.status(200).json(
        formatSuccessResponse({
          message: 'No input activity data found',
          interval: null
        })
      );
    }

    const classification = InputActivityCalculator.classifyActivityLevel(
      latestInterval.keyboard_contribution,
      latestInterval.mouse_contribution
    );

    return res.status(200).json(
      formatSuccessResponse({
        interval: {
          ...latestInterval,
          classification: classification
        }
      })
    );

  } catch (error) {
    console.error('Error fetching latest input:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to fetch latest input: ' + error.message, 500)
    );
  }
};

/**
 * Get aggregated input statistics with detailed breakdown
 * 
 * @route GET /api/input-activity/stats?start_date=2024-01-01&end_date=2024-01-31
 */
const getMyInputStats = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { start_date, end_date } = req.query;

    // Default to today if no dates provided
    const startDate = start_date ? new Date(start_date) : new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = end_date ? new Date(end_date) : new Date(new Date().setHours(23, 59, 59, 999));

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json(
        formatErrorResponse('Invalid date format', 400)
      );
    }

    const intervals = await InputActivity.getByEmployeeDateRange(employeeId, startDate, endDate);

    // Calculate aggregated statistics
    const aggregatedStats = InputActivityCalculator.aggregateIntervalStats(intervals);

    return res.status(200).json(
      formatSuccessResponse({
        date_range: {
          start: startDate,
          end: endDate
        },
        statistics: aggregatedStats
      })
    );

  } catch (error) {
    console.error('Error fetching input statistics:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to fetch input statistics: ' + error.message, 500)
    );
  }
};

// ============================================
// ORGANIZATION ENDPOINTS
// ============================================

/**
 * Get organization input activity comparison
 * (For organization admins to view team performance)
 * 
 * @route GET /api/input-activity/organization/comparison?date=2024-01-15
 */
const getOrganizationInputComparison = async (req, res) => {
  try {
    // Only allow organization users
    if (req.user.role !== 'organization') {
      return res.status(403).json(
        formatErrorResponse('Access denied. Organization role required.', 403)
      );
    }

    const organizationId = req.user.organizationId || req.user.id;
    const { date } = req.query;

    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();

    if (isNaN(targetDate.getTime())) {
      return res.status(400).json(
        formatErrorResponse('Invalid date format', 400)
      );
    }

    const comparison = await InputActivity.getOrganizationComparison(organizationId, targetDate);

    return res.status(200).json(
      formatSuccessResponse({
        date: targetDate,
        employees: comparison
      })
    );

  } catch (error) {
    console.error('Error fetching organization input comparison:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to fetch organization input comparison: ' + error.message, 500)
    );
  }
};

/**
 * Get organization input activity intervals
 * 
 * @route GET /api/input-activity/organization/intervals?start_date=2024-01-01&end_date=2024-01-31
 */
const getOrganizationInputIntervals = async (req, res) => {
  try {
    // Only allow organization users
    if (req.user.role !== 'organization') {
      return res.status(403).json(
        formatErrorResponse('Access denied. Organization role required.', 403)
      );
    }

    const organizationId = req.user.organizationId || req.user.id;
    const { start_date, end_date } = req.query;

    // Default to today if no dates provided
    const startDate = start_date ? new Date(start_date) : new Date(new Date().setHours(0, 0, 0, 0));
    const endDate = end_date ? new Date(end_date) : new Date(new Date().setHours(23, 59, 59, 999));

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json(
        formatErrorResponse('Invalid date format', 400)
      );
    }

    const intervals = await InputActivity.getByOrganizationDateRange(organizationId, startDate, endDate);

    return res.status(200).json(
      formatSuccessResponse({
        intervals: intervals,
        count: intervals.length,
        date_range: {
          start: startDate,
          end: endDate
        }
      })
    );

  } catch (error) {
    console.error('Error fetching organization input intervals:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to fetch organization input intervals: ' + error.message, 500)
    );
  }
};

/**
 * Get employee's own input activity intervals with corresponding screenshots
 * 
 * @route GET /api/input-activity/my-intervals-with-screenshots?start_date=2026-01-01&end_date=2026-01-07
 */
const getMyInputWithScreenshots = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { start_date, end_date } = req.query;

    // Default to today if no dates provided
    const endDate = end_date ? new Date(end_date) : new Date();
    endDate.setHours(23, 59, 59, 999); // End of day

    const startDate = start_date ? new Date(start_date) : new Date(endDate);
    startDate.setHours(0, 0, 0, 0); // Start of day

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json(
        formatErrorResponse('Invalid date format', 400)
      );
    }

    if (endDate < startDate) {
      return res.status(400).json(
        formatErrorResponse('End date must be after start date', 400)
      );
    }

    const intervalsWithScreenshots = await InputActivity.getWithScreenshotsByEmployee(
      employeeId,
      startDate,
      endDate
    );

    // Format the response to group data clearly
    const formattedIntervals = intervalsWithScreenshots.map(interval => ({
      id: interval.id,
      interval_start: interval.interval_start,
      interval_end: interval.interval_end,
      duration_minutes: Math.round((new Date(interval.interval_end) - new Date(interval.interval_start)) / 60000),
      productivity: {
        keyboard_contribution: parseFloat(interval.keyboard_contribution),
        mouse_contribution: parseFloat(interval.mouse_contribution),
        productive_percentage: parseFloat(interval.productive_percentage)
      },
      metrics: {
        total_keystrokes: interval.total_keystrokes,
        total_clicks: interval.total_clicks,
        total_mouse_distance: interval.total_mouse_distance,
        total_scroll_distance: interval.total_scroll_distance
      },
      screenshot: interval.screenshot_id ? {
        id: interval.screenshot_id,
        captured_at: interval.screenshot_captured_at,
        url: interval.screenshot_url,
        public_id: interval.screenshot_public_id
      } : null,
      created_at: interval.created_at
    }));

    return res.status(200).json(
      formatSuccessResponse({
        intervals: formattedIntervals,
        count: formattedIntervals.length,
        date_range: {
          start: startDate,
          end: endDate
        }
      })
    );

  } catch (error) {
    console.error('Error fetching input intervals with screenshots:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to fetch input intervals with screenshots: ' + error.message, 500)
    );
  }
};

/**
 * Get employee's input activity intervals with screenshots (for organization)
 * Organization can view any employee's data by selecting employee_id
 * 
 * @route GET /api/input-activity/employee-intervals-with-screenshots?employee_id=xxx&start_date=2026-01-01&end_date=2026-01-07
 */
const getEmployeeInputWithScreenshots = async (req, res) => {
  try {
    // Only allow organization users
    if (req.user.role !== 'organization') {
      return res.status(403).json(
        formatErrorResponse('Access denied. Organization role required.', 403)
      );
    }

    const organizationId = req.user.organizationId || req.user.id;
    const { employee_id, start_date, end_date } = req.query;

    // Validate employee_id is provided
    if (!employee_id) {
      return res.status(400).json(
        formatErrorResponse('employee_id query parameter is required', 400)
      );
    }

    // Default to today if no dates provided
    const endDate = end_date ? new Date(end_date) : new Date();
    endDate.setHours(23, 59, 59, 999); // End of day

    const startDate = start_date ? new Date(start_date) : new Date(endDate);
    startDate.setHours(0, 0, 0, 0); // Start of day

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json(
        formatErrorResponse('Invalid date format', 400)
      );
    }

    if (endDate < startDate) {
      return res.status(400).json(
        formatErrorResponse('End date must be after start date', 400)
      );
    }

    const intervalsWithScreenshots = await InputActivity.getWithScreenshotsByOrganization(
      organizationId,
      employee_id,
      startDate,
      endDate
    );

    // Format the response with employee info
    const formattedIntervals = intervalsWithScreenshots.map(interval => ({
      id: interval.id,
      interval_start: interval.interval_start,
      interval_end: interval.interval_end,
      duration_minutes: Math.round((new Date(interval.interval_end) - new Date(interval.interval_start)) / 60000),
      employee: {
        name: interval.employee_name,
        email: interval.employee_email,
        department: interval.employee_department,
        position: interval.employee_position
      },
      productivity: {
        keyboard_contribution: parseFloat(interval.keyboard_contribution),
        mouse_contribution: parseFloat(interval.mouse_contribution),
        productive_percentage: parseFloat(interval.productive_percentage)
      },
      metrics: {
        total_keystrokes: interval.total_keystrokes,
        total_clicks: interval.total_clicks,
        total_mouse_distance: interval.total_mouse_distance,
        total_scroll_distance: interval.total_scroll_distance
      },
      screenshot: interval.screenshot_id ? {
        id: interval.screenshot_id,
        captured_at: interval.screenshot_captured_at,
        url: interval.screenshot_url,
        public_id: interval.screenshot_public_id
      } : null,
      created_at: interval.created_at
    }));

    return res.status(200).json(
      formatSuccessResponse({
        intervals: formattedIntervals,
        count: formattedIntervals.length,
        employee_id: employee_id,
        date_range: {
          start: startDate,
          end: endDate
        }
      })
    );

  } catch (error) {
    console.error('Error fetching employee input intervals with screenshots:', error);
    return res.status(500).json(
      formatErrorResponse('Failed to fetch employee input intervals with screenshots: ' + error.message, 500)
    );
  }
};

module.exports = {
  ingestInputActivity,
  getMyInputIntervals,
  getMyDailyInputStats,
  getMyInputTrends,
  getMyLatestInput,
  getMyInputStats,
  getOrganizationInputComparison,
  getOrganizationInputIntervals,
  getMyInputWithScreenshots,
  getEmployeeInputWithScreenshots
};
