const PerformanceScore = require('../models/PerformanceScore');
const Employee = require('../models/Employee');
const Organization = require('../models/Organization');
const PerformanceScoring = require('../utils/performanceScoring');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/helpers');

// Create or update performance score for employee
const createPerformanceScore = async (req, res) => {
  try {
    const { workingTime, idleTime, absentTime, distractedTime, scoreDate } = req.body;
    const employeeId = req.user.id; // Employee creating their own score
    const organizationId = req.user.organizationId; // Fixed: use organizationId instead of organization_id

    // Validate required fields
    if (workingTime === undefined || idleTime === undefined || 
        absentTime === undefined || distractedTime === undefined) {
      return res.status(400).json(
        formatErrorResponse('All time metrics are required: workingTime, idleTime, absentTime, distractedTime', 400)
      );
    }

    // Use current date if not provided
    const targetDate = scoreDate || new Date().toISOString().split('T')[0];

    // Check if score already exists for this date
    const existingScore = await PerformanceScore.scoreExistsForDate(employeeId, targetDate);
    if (existingScore) {
      return res.status(409).json(
        formatErrorResponse('Performance score for this date already exists. Use update endpoint to modify.', 409)
      );
    }

    // Calculate performance scores using the scoring engine
    const timeMetrics = { workingTime, idleTime, absentTime, distractedTime };
    const calculatedScores = PerformanceScoring.calculatePerformanceScores(timeMetrics);

    // Prepare data for database insertion
    const scoreData = {
      employee_id: employeeId,
      organization_id: organizationId,
      working_time: workingTime,
      idle_time: idleTime,
      absent_time: absentTime,
      distracted_time: distractedTime,
      total_time: calculatedScores.totalTime,
      productivity_score: calculatedScores.productivityScore,
      engagement_score: calculatedScores.engagementScore,
      overall_score: calculatedScores.overallScore,
      performance_grade: calculatedScores.performanceGrade,
      score_date: targetDate
    };

    // Save to database
    const newScore = await PerformanceScore.create(scoreData);

    // Get performance insights
    const insights = PerformanceScoring.getPerformanceInsights(calculatedScores);

    res.status(201).json(
      formatSuccessResponse({
        performanceScore: newScore,
        calculatedMetrics: calculatedScores,
        insights: insights
      }, 'Performance score created successfully')
    );

  } catch (error) {
    console.error('Create performance score error:', error);
    
    if (error.message.includes('Invalid time inputs')) {
      return res.status(400).json(
        formatErrorResponse(error.message, 400)
      );
    }

    if (error.message.includes('already exists')) {
      return res.status(409).json(
        formatErrorResponse(error.message, 409)
      );
    }

    res.status(500).json(
      formatErrorResponse('Internal server error while creating performance score')
    );
  }
};



// Get my performance scores (employee)
const getMyPerformanceScores = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { limit = 30 } = req.query;

    console.log('Debug - Employee ID from token:', employeeId);
    console.log('Debug - User object:', req.user);
    console.log('Debug - Limit:', limit);

    const scores = await PerformanceScore.getByEmployee(employeeId, parseInt(limit));

    console.log('Debug - Scores returned:', scores.length);
    console.log('Debug - First score:', scores[0]);

    res.status(200).json(
      formatSuccessResponse({
        performanceScores: scores,
        count: scores.length
      }, 'Performance scores retrieved successfully')
    );

  } catch (error) {
    console.error('Get my performance scores error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching performance scores')
    );
  }
};

// Get employee performance scores (organization)
const getEmployeePerformanceScores = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 30 } = req.query;
    const organizationId = req.user.id;

    // Validate employee belongs to organization
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    if (employee.organization_id !== organizationId) {
      return res.status(403).json(
        formatErrorResponse('Access denied. Employee does not belong to your organization', 403)
      );
    }

    const scores = await PerformanceScore.getByEmployee(employeeId, parseInt(limit));

    res.status(200).json(
      formatSuccessResponse({
        employee: {
          id: employee.id,
          name: employee.name,
          department: employee.department,
          position: employee.position
        },
        performanceScores: scores,
        count: scores.length
      }, 'Employee performance scores retrieved successfully')
    );

  } catch (error) {
    console.error('Get employee performance scores error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching employee performance scores')
    );
  }
};



// Get performance trends for employee
const getPerformanceTrends = async (req, res) => {
  try {
    const employeeId = req.user.role === 'employee' ? req.user.id : req.params.employeeId;
    const { days = 30 } = req.query;

    // If organization is requesting trends for specific employee, validate access
    if (req.user.role === 'organization' && req.params.employeeId) {
      const employee = await Employee.findById(req.params.employeeId);
      if (!employee || employee.organization_id !== req.user.id) {
        return res.status(403).json(
          formatErrorResponse('Access denied. Employee does not belong to your organization', 403)
        );
      }
    }

    const trends = await PerformanceScore.getEmployeeTrends(employeeId, parseInt(days));

    res.status(200).json(
      formatSuccessResponse({
        trends,
        period: `${days} days`,
        count: trends.length
      }, 'Performance trends retrieved successfully')
    );

  } catch (error) {
    console.error('Get performance trends error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching performance trends')
    );
  }
};

// Get organization analytics (organization and admin only)
const getOrganizationAnalytics = async (req, res) => {
  try {
    const organizationId = req.user.role === 'organization' ? req.user.id : req.params.organizationId;
    const { days = 30 } = req.query;

    // If admin is requesting specific organization analytics, validate organization exists
    if (req.user.role === 'admin' && req.params.organizationId) {
      const organization = await Organization.findById(req.params.organizationId);
      if (!organization) {
        return res.status(404).json(
          formatErrorResponse('Organization not found', 404)
        );
      }
    }

    const analytics = await PerformanceScore.getOrganizationAnalytics(organizationId, parseInt(days));

    res.status(200).json(
      formatSuccessResponse({
        analytics,
        period: `${days} days`
      }, 'Organization analytics retrieved successfully')
    );

  } catch (error) {
    console.error('Get organization analytics error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching organization analytics')
    );
  }
};



module.exports = {
  createPerformanceScore,
  getMyPerformanceScores,
  getEmployeePerformanceScores,
  getPerformanceTrends,
  getOrganizationAnalytics,
};
