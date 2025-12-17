const Employee = require('../models/Employee');
const Organization = require('../models/Organization');
const { sendEmployeeCredentials } = require('../utils/emailService');
const { generateRandomPassword, formatSuccessResponse, formatErrorResponse, removePasswordFromUser, capitalizeWords } = require('../utils/helpers');

// Create a new employee
const createEmployee = async (req, res) => {
  try {
    const { name, email, department, position } = req.body;
    const organizationId = req.user.id; // Get organization ID from authenticated user

    // Generate random password
    const password = generateRandomPassword();

    // Create employee data
    const employeeData = {
      organization_id: organizationId,
      name: capitalizeWords(name),
      email: email.toLowerCase(),
      department: department ? capitalizeWords(department) : null,
      position: position ? capitalizeWords(position) : null,
      password
    };

    // Create employee in database
    const newEmployee = await Employee.create(employeeData);

    // Get organization details for email
    const organization = await Organization.findById(organizationId);

    // Send credentials via email
    try {
      await sendEmployeeCredentials(newEmployee, password, organization.name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue execution but log the error
    }

    res.status(201).json(
      formatSuccessResponse({
        employee: newEmployee,
        message: 'Employee created successfully. Credentials sent to email.'
      }, 'Employee created successfully')
    );

  } catch (error) {
    console.error('Create employee error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json(
        formatErrorResponse('Employee with this email already exists', 409)
      );
    }

    res.status(500).json(
      formatErrorResponse('Internal server error while creating employee')
    );
  }
};

// Get all employees for the organization
const getMyEmployees = async (req, res) => {
  try {
    const organizationId = req.user.id;

    const employees = await Employee.getEmployeesByOrganization(organizationId);
    const organization = await Organization.findById(organizationId);

    res.status(200).json(
      formatSuccessResponse({
        organization: {
          id: organization.id,
          name: organization.name
        },
        employees,
        count: employees.length
      }, 'Organization employees retrieved successfully')
    );

  } catch (error) {
    console.error('Get my employees error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching employees')
    );
  }
};

// Get employee by ID (only from same organization)
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.id;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    // Check if employee belongs to this organization
    if (employee.organization_id !== organizationId) {
      return res.status(403).json(
        formatErrorResponse('Access denied. Employee does not belong to your organization', 403)
      );
    }

    res.status(200).json(
      formatSuccessResponse({
        employee
      }, 'Employee retrieved successfully')
    );

  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching employee')
    );
  }
};

// Update employee (only from same organization)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, position } = req.body;
    const organizationId = req.user.id;

    // Check if employee exists and belongs to this organization
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    if (existingEmployee.organization_id !== organizationId) {
      return res.status(403).json(
        formatErrorResponse('Access denied. Employee does not belong to your organization', 403)
      );
    }

    // Update employee data
    const updateData = {
      name: name ? capitalizeWords(name) : undefined,
      department: department ? capitalizeWords(department) : undefined,
      position: position ? capitalizeWords(position) : undefined
    };

    const updatedEmployee = await Employee.updateEmployee(id, updateData);

    res.status(200).json(
      formatSuccessResponse({
        employee: updatedEmployee
      }, 'Employee updated successfully')
    );

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while updating employee')
    );
  }
};

// Delete employee (only from same organization)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.id;

    // Check if employee exists and belongs to this organization
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json(
        formatErrorResponse('Employee not found', 404)
      );
    }

    if (existingEmployee.organization_id !== organizationId) {
      return res.status(403).json(
        formatErrorResponse('Access denied. Employee does not belong to your organization', 403)
      );
    }

    // Delete employee
    await Employee.deleteEmployee(id);

    res.status(200).json(
      formatSuccessResponse({
        deletedEmployeeId: id
      }, 'Employee deleted successfully')
    );

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while deleting employee')
    );
  }
};

// Get organization profile
const getMyProfile = async (req, res) => {
  try {
    const organizationId = req.user.id;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json(
        formatErrorResponse('Organization not found', 404)
      );
    }

    res.status(200).json(
      formatSuccessResponse({
        organization
      }, 'Organization profile retrieved successfully')
    );

  } catch (error) {
    console.error('Get organization profile error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching organization profile')
    );
  }
};

// Update organization profile
const updateMyProfile = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const { name, industry, location } = req.body;

    // Update organization data
    const updateData = {
      name: name ? capitalizeWords(name) : undefined,
      industry: industry ? capitalizeWords(industry) : undefined,
      location: location ? capitalizeWords(location) : undefined
    };

    const updatedOrganization = await Organization.updateOrganization(organizationId, updateData);

    res.status(200).json(
      formatSuccessResponse({
        organization: updatedOrganization
      }, 'Organization profile updated successfully')
    );

  } catch (error) {
    console.error('Update organization profile error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while updating organization profile')
    );
  }
};

// Get organization dashboard statistics
const getOrganizationDashboard = async (req, res) => {
  try {
    const organizationId = req.user.id;

    const employees = await Employee.getEmployeesByOrganization(organizationId);
    const organization = await Organization.findById(organizationId);

    // Calculate department statistics
    const departmentStats = employees.reduce((stats, employee) => {
      const dept = employee.department || 'Not specified';
      stats[dept] = (stats[dept] || 0) + 1;
      return stats;
    }, {});

    // Calculate position statistics
    const positionStats = employees.reduce((stats, employee) => {
      const pos = employee.position || 'Not specified';
      stats[pos] = (stats[pos] || 0) + 1;
      return stats;
    }, {});

    const dashboardData = {
      organization: {
        id: organization.id,
        name: organization.name,
        industry: organization.industry,
        location: organization.location
      },
      statistics: {
        totalEmployees: employees.length,
        departmentBreakdown: departmentStats,
        positionBreakdown: positionStats
      },
      recentEmployees: employees.slice(0, 5) // Last 5 employees
    };

    res.status(200).json(
      formatSuccessResponse(dashboardData, 'Organization dashboard data retrieved successfully')
    );

  } catch (error) {
    console.error('Get organization dashboard error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching dashboard data')
    );
  }
};

// Get organization analytics (aggregated performance data)
const getOrganizationAnalytics = async (req, res) => {
  try {
    const organizationId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const CalculatedScore = require('../models/CalculatedScore');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get aggregated scores for all employees in the organization
    const scores = await CalculatedScore.getOrganizationAggregatedScores(organizationId, startDate, endDate);

    if (scores.length === 0) {
      return res.status(200).json(
        formatSuccessResponse({
          analytics: {
            average_score: 0,
            average_productivity: 0,
            average_engagement: 0,
            average_working_time: 0,
            average_unproductive_time: 0,
            total_employees: 0,
            grade_distribution: {}
          }
        }, 'No analytics data available for the specified period')
      );
    }

    // Calculate averages
    const totals = scores.reduce((acc, score) => ({
      overall: acc.overall + (parseFloat(score.avg_overall_score) || 0),
      productivity: acc.productivity + (parseFloat(score.avg_productivity_score) || 0),
      engagement: acc.engagement + (parseFloat(score.avg_engagement_score) || 0),
      working: acc.working + (parseFloat(score.total_working) || 0),
      distracted: acc.distracted + (parseFloat(score.total_distracted) || 0),
      idle: acc.idle + (parseFloat(score.total_idle) || 0)
    }), { overall: 0, productivity: 0, engagement: 0, working: 0, distracted: 0, idle: 0 });

    const avgOverall = totals.overall / scores.length;
    const avgProductivity = totals.productivity / scores.length;
    const avgEngagement = totals.engagement / scores.length;
    const avgWorking = totals.working / scores.length;
    const avgUnproductive = (totals.distracted + totals.idle) / scores.length;

    // Grade distribution - employee-wise (get most recent grade for each employee)
    const employeeLatestGrades = new Map();
    scores.forEach(score => {
      const empId = score.employee_id;
      // Since scores are ordered by date DESC, first occurrence is the latest
      if (!employeeLatestGrades.has(empId)) {
        employeeLatestGrades.set(empId, score.performance_grade || 'F');
      }
    });

    const gradeDistribution = Array.from(employeeLatestGrades.values()).reduce((acc, grade) => {
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    const analyticsData = {
      analytics: {
        average_score: Math.round(avgOverall * 100) / 100,
        average_productivity: Math.round(avgProductivity * 100) / 100,
        average_engagement: Math.round(avgEngagement * 100) / 100,
        average_working_time: Math.round(avgWorking * 100) / 100, // Already in minutes
        average_unproductive_time: Math.round(avgUnproductive * 100) / 100, // Already in minutes
        total_employees: new Set(scores.map(s => s.employee_id)).size,
        grade_distribution: gradeDistribution,
        days_analyzed: days
      }
    };

    res.status(200).json(
      formatSuccessResponse(analyticsData, 'Organization analytics retrieved successfully')
    );

  } catch (error) {
    console.error('Get organization analytics error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching organization analytics')
    );
  }
};

// Get employee performance scores (for organization to view)
const getEmployeePerformanceScores = async (req, res) => {
  try {
    const { id: employeeId } = req.params;
    const organizationId = req.user.id;
    const limit = parseInt(req.query.limit) || 30;

    // Verify employee belongs to this organization
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

    const CalculatedScore = require('../models/CalculatedScore');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limit);

    const scores = await CalculatedScore.getByEmployeeDateRange(employeeId, startDate, endDate);

    res.status(200).json(
      formatSuccessResponse({
        employee: {
          id: employee.id,
          name: employee.name,
          department: employee.department,
          position: employee.position
        },
        scores: scores,
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

// Get employee performance trends (for organization to view)
const getEmployeePerformanceTrends = async (req, res) => {
  try {
    const { id: employeeId } = req.params;
    const organizationId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    // Verify employee belongs to this organization
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

    const CalculatedScore = require('../models/CalculatedScore');

    const trends = await CalculatedScore.getPerformanceTrends(employeeId, days);

    res.status(200).json(
      formatSuccessResponse({
        employee: {
          id: employee.id,
          name: employee.name,
          department: employee.department,
          position: employee.position
        },
        trends: trends,
        days: days
      }, 'Employee performance trends retrieved successfully')
    );

  } catch (error) {
    console.error('Get employee performance trends error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching employee performance trends')
    );
  }
};

module.exports = {
  createEmployee,
  getMyEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
  updateMyProfile,
  getOrganizationDashboard,
  getOrganizationAnalytics,
  getEmployeePerformanceScores,
  getEmployeePerformanceTrends
};