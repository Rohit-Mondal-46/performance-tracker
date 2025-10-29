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

module.exports = {
  createEmployee,
  getMyEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
  updateMyProfile,
  getOrganizationDashboard
};