const PerformanceScore = require('../models/PerformanceScore');
const Employee = require('../models/Employee');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/helpers');

// Generate daily performance score
const generateDailyScore = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date, workTime, monitoredTime, engagedFrames, totalFrames, customWeights } = req.body;

    // Validate employee exists and user has permission
    if (req.user.role === 'employee' && req.user.id !== parseInt(employeeId)) {
      return res.status(403).json(
        formatErrorResponse('Access denied: Can only generate scores for yourself', 403)
      );
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    // Validate required data
    if (!date || workTime === undefined || monitoredTime === undefined || 
        engagedFrames === undefined || totalFrames === undefined) {
      return res.status(400).json(
        formatErrorResponse('Missing required activity data', 400)
      );
    }

    const activityData = { workTime, monitoredTime, engagedFrames, totalFrames };
    const score = await PerformanceScore.generateDailyScore(
      employeeId, date, activityData, customWeights
    );

    res.status(201).json(
      formatSuccessResponse({ score }, 'Performance score generated successfully')
    );

  } catch (error) {
    console.error('Generate daily score error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while generating performance score')
    );
  }
};

// Get employee performance scores
const getEmployeePerformance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, scoreType = 'daily', limit = 30, offset = 0 } = req.query;

    // Check permissions
    if (req.user.role === 'employee' && req.user.id !== parseInt(employeeId)) {
      return res.status(403).json(
        formatErrorResponse('Access denied: Can only view your own performance', 403)
      );
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    const scores = await PerformanceScore.getEmployeeScores(employeeId, {
      startDate, endDate, scoreType, limit: parseInt(limit), offset: parseInt(offset)
    });

    const averages = await PerformanceScore.getAverageScores(employeeId, 30);

    res.status(200).json(
      formatSuccessResponse({
        scores,
        averages,
        employee: {
          id: employee.id,
          name: employee.name,
          department: employee.department,
          position: employee.position
        }
      }, 'Performance data retrieved successfully')
    );

  } catch (error) {
    console.error('Get employee performance error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching performance data')
    );
  }
};

// Get my performance (for employees)
const getMyPerformance = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { startDate, endDate, scoreType = 'daily', limit = 30 } = req.query;

    const scores = await PerformanceScore.getEmployeeScores(employeeId, {
      startDate, endDate, scoreType, limit: parseInt(limit)
    });

    const averages = await PerformanceScore.getAverageScores(employeeId, 30);
    const latestScore = await PerformanceScore.getLatestScore(employeeId);

    res.status(200).json(
      formatSuccessResponse({
        scores,
        averages,
        latestScore,
        summary: {
          totalDays: scores.length,
          bestScore: scores.length > 0 ? Math.max(...scores.map(s => s.final_score)) : 0,
          avgScore: averages.avg_final_score || 0
        }
      }, 'Your performance data retrieved successfully')
    );

  } catch (error) {
    console.error('Get my performance error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching your performance data')
    );
  }
};

// Record activity and auto-generate score
const recordActivity = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { 
      date = new Date().toISOString().split('T')[0], 
      workTime, 
      monitoredTime, 
      engagedFrames, 
      totalFrames 
    } = req.body;

    // Validate required data
    if (workTime === undefined || monitoredTime === undefined || 
        engagedFrames === undefined || totalFrames === undefined) {
      return res.status(400).json(
        formatErrorResponse('Missing required activity data', 400)
      );
    }

    const activityData = { workTime, monitoredTime, engagedFrames, totalFrames };
    const score = await PerformanceScore.generateDailyScore(employeeId, date, activityData);

    res.status(201).json(
      formatSuccessResponse({ 
        score,
        message: `Daily performance score: ${score.final_score}%`
      }, 'Activity recorded and performance score updated')
    );

  } catch (error) {
    console.error('Record activity error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while recording activity')
    );
  }
};

module.exports = {
  generateDailyScore,
  getEmployeePerformance,
  getMyPerformance,
  recordActivity
};