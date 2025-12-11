const ActivityInterval = require('../models/ActivityInterval');
const CalculatedScore = require('../models/CalculatedScore');
const ActivityBasedScoring = require('../utils/activityBasedScoring');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/helpers');

/**
 * ============================================================================
 * ACTIVITY INGESTION CONTROLLER
 * ============================================================================
 * 
 * Handles incoming activity data from desktop app and triggers scoring pipeline
 */

/**
 * Ingest 10-minute activity batch from desktop app
 * 
 * POST /api/activities/ingest
 * Body: {
 *   interval_start: "2025-12-10T10:00:00Z",
 *   interval_end: "2025-12-10T10:10:00Z",
 *   typing: 245,
 *   writing: 40,
 *   reading: 120,
 *   phone: 30,
 *   gesturing: 15,
 *   looking_away: 50,
 *   idle: 80
 * }
 */
const ingestActivityBatch = async (req, res) => {
  try {
    const {
      interval_start,
      interval_end,
      typing,
      writing,
      reading,
      phone,
      gesturing,
      looking_away,
      idle
    } = req.body;

    // Get employee info from authenticated user
    const employeeId = req.user.id;
    const organizationId = req.user.organizationId;

    // Validate required fields
    if (!interval_start || !interval_end) {
      return res.status(400).json(
        formatErrorResponse('interval_start and interval_end are required', 400)
      );
    }

    // Validate interval timestamps
    const startTime = new Date(interval_start);
    const endTime = new Date(interval_end);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json(
        formatErrorResponse('Invalid timestamp format', 400)
      );
    }

    if (endTime <= startTime) {
      return res.status(400).json(
        formatErrorResponse('interval_end must be after interval_start', 400)
      );
    }

    // Check if interval already exists (prevent duplicates)
    const exists = await ActivityInterval.intervalExists(employeeId, startTime);
    if (exists) {
      return res.status(409).json(
        formatErrorResponse('Activity interval already exists for this time window', 409)
      );
    }

    // Validate incoming interval data (must be within 10-minute limits)
    const intervalValidation = ActivityBasedScoring.validateActivityInputs({
      typing: typing || 0,
      writing: writing || 0,
      reading: reading || 0,
      phone: phone || 0,
      gesturing: gesturing || 0,
      looking_away: looking_away || 0,
      idle: idle || 0
    });

    if (intervalValidation.length > 0) {
      return res.status(400).json(
        formatErrorResponse(`Invalid activity inputs: ${intervalValidation.join(', ')}`, 400)
      );
    }

    // Prepare activity data
    const activityData = {
      employee_id: employeeId,
      organization_id: organizationId,
      interval_start: startTime,
      interval_end: endTime,
      typing: typing || 0,
      writing: writing || 0,
      reading: reading || 0,
      phone: phone || 0,
      gesturing: gesturing || 0,
      looking_away: looking_away || 0,
      idle: idle || 0
    };

    // STEP 1: Insert raw activity interval
    const rawActivity = await ActivityInterval.create(activityData);

    // STEP 2: Get the date of this interval (for daily aggregation)
    const intervalDate = new Date(startTime);
    intervalDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // STEP 3: Retrieve ALL intervals for this employee for this date
    const allIntervalsForDate = await CalculatedScore.getIntervalsForDate(
      employeeId,
      intervalDate
    );

    // STEP 4: Aggregate all intervals into daily totals
    const dailyAggregated = CalculatedScore.aggregateIntervalsForDay(allIntervalsForDate);

    // STEP 5: Compute daily scores from aggregated totals (skip validation for daily totals)
    const dailyScores = ActivityBasedScoring.computeScoresWithoutValidation({
      typing: dailyAggregated.typing,
      writing: dailyAggregated.writing,
      reading: dailyAggregated.reading,
      phone: dailyAggregated.phone,
      gesturing: dailyAggregated.gesturing,
      looking_away: dailyAggregated.looking_away,
      idle: dailyAggregated.idle
    });

    // STEP 6: Upsert daily calculated score (INSERT new or UPDATE existing)
    const calculatedScore = await CalculatedScore.upsertDailyScore({
      employee_id: employeeId,
      organization_id: organizationId,
      score_date: intervalDate,
      working_total: dailyScores.working_total,
      distracted_total: dailyScores.distracted_total,
      idle_total: dailyScores.idle_total,
      grand_total: dailyScores.grand_total,
      productivity_score: dailyScores.productivity_score,
      engagement_score: dailyScores.engagement_score,
      overall_score: dailyScores.overall_score,
      performance_grade: dailyScores.performance_grade,
      interval_count: dailyAggregated.interval_count
    });

    // STEP 7: Get performance insights based on daily scores
    const insights = ActivityBasedScoring.getPerformanceInsights(dailyScores);

    // Return success response
    res.status(201).json(
      formatSuccessResponse({
        raw_activity: rawActivity,
        daily_calculated_score: calculatedScore,
        insights: insights,
        message: calculatedScore.interval_count === 1 
          ? 'First activity for this date - daily score created'
          : `Daily score updated (${calculatedScore.interval_count} intervals aggregated)`
      }, 'Activity batch ingested successfully')
    );

  } catch (error) {
    console.error('Ingest activity batch error:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json(
        formatErrorResponse(error.message, 409)
      );
    }

    res.status(500).json(
      formatErrorResponse('Internal server error while ingesting activity data')
    );
  }
};

/**
 * Get calculated scores for employee (with date filtering)
 * 
 * GET /api/activities/scores?start_date=2025-12-01&end_date=2025-12-10&limit=100
 */
const getMyCalculatedScores = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { start_date, end_date, limit = 100 } = req.query;

    // Default to last 7 days if no date range provided
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const scores = await CalculatedScore.getByEmployeeDateRange(
      employeeId,
      startDate,
      endDate
    );

    // Apply limit
    const limitedScores = scores.slice(0, parseInt(limit));

    res.status(200).json(
      formatSuccessResponse({
        scores: limitedScores,
        count: limitedScores.length,
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }, 'Calculated scores retrieved successfully')
    );

  } catch (error) {
    console.error('Get calculated scores error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while retrieving scores')
    );
  }
};

/**
 * Get today's score for employee
 * 
 * GET /api/activities/daily-scores
 */
const getMyDailyScores = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayScore = await CalculatedScore.getByEmployeeAndDate(
      employeeId,
      today
    );

    if (!todayScore) {
      return res.status(404).json(
        formatErrorResponse('No activity data for today', 404)
      );
    }

    res.status(200).json(
      formatSuccessResponse({
        daily_score: todayScore,
        date: today.toISOString().split('T')[0]
      }, "Today's score retrieved successfully")
    );

  } catch (error) {
    console.error('Get daily score error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while retrieving daily score')
    );
  }
};

/**
 * Get performance trends for employee
 * 
 * GET /api/activities/trends?days=7
 */
const getMyPerformanceTrends = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { days = 7 } = req.query;

    const trends = await CalculatedScore.getPerformanceTrends(
      employeeId,
      parseInt(days)
    );

    res.status(200).json(
      formatSuccessResponse({
        trends: trends,
        days: parseInt(days)
      }, 'Performance trends retrieved successfully')
    );

  } catch (error) {
    console.error('Get performance trends error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while retrieving trends')
    );
  }
};

/**
 * Get latest activity interval for employee
 * 
 * GET /api/activities/latest
 */
const getMyLatestActivity = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const latestActivity = await ActivityInterval.getLatestByEmployee(employeeId);

    if (!latestActivity) {
      return res.status(404).json(
        formatErrorResponse('No activity data found', 404)
      );
    }

    // Get the date of the latest activity
    const activityDate = new Date(latestActivity.interval_start);
    activityDate.setHours(0, 0, 0, 0);

    // Get daily calculated score for that date
    const calculatedScore = await CalculatedScore.getByEmployeeAndDate(
      employeeId,
      activityDate
    );

    res.status(200).json(
      formatSuccessResponse({
        latest_activity: latestActivity,
        daily_calculated_score: calculatedScore
      }, 'Latest activity retrieved successfully')
    );

  } catch (error) {
    console.error('Get latest activity error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while retrieving latest activity')
    );
  }
};

module.exports = {
  ingestActivityBatch,
  getMyCalculatedScores,
  getMyDailyScores,
  getMyPerformanceTrends,
  getMyLatestActivity
};
