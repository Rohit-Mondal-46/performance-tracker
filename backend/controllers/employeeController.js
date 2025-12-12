const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const { formatSuccessResponse, formatErrorResponse, removePasswordFromUser, capitalizeWords } = require('../utils/helpers');

// Get employee profile
const getMyProfile = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    // Remove password from response
    const employeeData = removePasswordFromUser(employee);

    res.status(200).json(
      formatSuccessResponse({
        employee: employeeData
      }, 'Employee profile retrieved successfully')
    );

  } catch (error) {
    console.error('Get employee profile error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching employee profile')
    );
  }
};

// Update employee profile (limited fields)
const updateMyProfile = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { name, department, position } = req.body;

    // Check if employee exists
    const existingEmployee = await Employee.findById(employeeId);
    if (!existingEmployee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    // Update employee data (employees can only update certain fields)
    const updateData = {
      name: name ? capitalizeWords(name) : undefined,
      department: department ? capitalizeWords(department) : undefined,
      position: position ? capitalizeWords(position) : undefined
    };

    const updatedEmployee = await Employee.updateEmployee(employeeId, updateData);
    const employeeData = removePasswordFromUser(updatedEmployee);

    res.status(200).json(
      formatSuccessResponse({
        employee: employeeData
      }, 'Employee profile updated successfully')
    );

  } catch (error) {
    console.error('Update employee profile error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while updating employee profile')
    );
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        formatErrorResponse('Current password and new password are required', 400)
      );
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        formatErrorResponse('New password must be at least 6 characters long', 400)
      );
    }

    // Get employee with password
    const employee = await Employee.findByEmail(req.user.email);
    if (!employee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await Employee.verifyPassword(currentPassword, employee.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json(
        formatErrorResponse('Current password is incorrect', 401)
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    const pool = require('../config/database');
    await pool.query(
      'UPDATE employees SET password = $1 WHERE id = $2',
      [hashedNewPassword, employeeId]
    );

    res.status(200).json(
      formatSuccessResponse(null, 'Password changed successfully')
    );

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while changing password')
    );
  }
};

// Get employee dashboard/summary
const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    // Remove password from response
    const employeeData = removePasswordFromUser(employee);

    // Use CalculatedScore model
    const CalculatedScore = require('../models/CalculatedScore');

    // Get performance data for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const scores = await CalculatedScore.getByEmployeeDateRange(employeeId, startDate, endDate);
    
    // Calculate averages
    let avgProductivity = 0;
    let avgEngagement = 0;
    let avgOverall = 0;
    
    if (scores.length > 0) {
      const totals = scores.reduce((acc, score) => ({
        productivity: acc.productivity + (parseFloat(score.productivity_score) || 0),
        engagement: acc.engagement + (parseFloat(score.engagement_score) || 0),
        overall: acc.overall + (parseFloat(score.overall_score) || 0)
      }), { productivity: 0, engagement: 0, overall: 0 });
      
      avgProductivity = totals.productivity / scores.length;
      avgEngagement = totals.engagement / scores.length;
      avgOverall = totals.overall / scores.length;
    }

    // Get latest score
    const latestScore = scores.length > 0 ? scores[scores.length - 1] : null;

    // Get last 7 days for trend
    const last7Days = scores.slice(-7);
    
    // Calculate performance trend
    let performanceTrend = 'stable';
    if (scores.length >= 14) {
      const lastWeekScores = scores.slice(-7);
      const prevWeekScores = scores.slice(-14, -7);
      
      const lastWeekAvg = lastWeekScores.reduce((sum, s) => sum + (parseFloat(s.overall_score) || 0), 0) / lastWeekScores.length;
      const prevWeekAvg = prevWeekScores.reduce((sum, s) => sum + (parseFloat(s.overall_score) || 0), 0) / prevWeekScores.length;
      
      if (lastWeekAvg > prevWeekAvg + 2) performanceTrend = 'improving';
      else if (lastWeekAvg < prevWeekAvg - 2) performanceTrend = 'declining';
    }

    const dashboardData = {
      employee: employeeData,
      summary: {
        joinDate: employeeData.created_at,
        organization: employeeData.organization_name,
        department: employeeData.department || 'Not specified',
        position: employeeData.position || 'Not specified'
      },
      metrics: {
        performanceRating: Math.round(avgOverall * 100) / 100,
        productivityScore: Math.round(avgProductivity * 100) / 100,
        engagementScore: Math.round(avgEngagement * 100) / 100,
        totalActiveDays: scores.length,
        lastActivity: latestScore?.score_date || employeeData.created_at,
        performanceTrend: performanceTrend
      },
      recentPerformance: {
        latestScore: latestScore ? {
          date: latestScore.score_date,
          finalScore: latestScore.overall_score,
          productivityScore: latestScore.productivity_score,
          engagementScore: latestScore.engagement_score
        } : null,
        last7Days: last7Days.map(score => ({
          date: score.score_date,
          score: score.overall_score
        })),
        monthlyAverage: {
          finalScore: avgOverall,
          productivity: avgProductivity,
          engagement: avgEngagement,
          daysTracked: scores.length
        }
      },
      // Performance status based on score ranges
      performanceStatus: {
        rating: avgOverall >= 80 ? 'excellent' : 
                avgOverall >= 60 ? 'good' : 
                avgOverall >= 40 ? 'needs_improvement' : 'poor',
        message: avgOverall >= 80 ? 'Outstanding performance!' : 
                 avgOverall >= 60 ? 'Good work, keep it up!' : 
                 avgOverall >= 40 ? 'Room for improvement' : 'Focus needed',
        color: avgOverall >= 80 ? 'green' : 
               avgOverall >= 60 ? 'blue' : 
               avgOverall >= 40 ? 'yellow' : 'red'
      }
    };

    res.status(200).json(
      formatSuccessResponse(dashboardData, 'Employee dashboard data retrieved successfully')
    );

  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching dashboard data')
    );
  }
};

// Get employee settings/preferences
const getMySettings = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    // Return basic settings (in a real app, you might have a settings table)
    const settings = {
      accountInfo: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        created_at: employee.created_at
      },
      organizationInfo: {
        organizationId: employee.organization_id,
        organizationName: employee.organization_name,
        department: employee.department,
        position: employee.position
      },
      // These would be actual user preferences in a production app
      preferences: {
        emailNotifications: true,
        dashboardLayout: 'default',
        timezone: 'UTC',
        language: 'en'
      }
    };

    res.status(200).json(
      formatSuccessResponse(settings, 'Employee settings retrieved successfully')
    );

  } catch (error) {
    console.error('Get employee settings error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching employee settings')
    );
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getEmployeeDashboard,
  getMySettings
};