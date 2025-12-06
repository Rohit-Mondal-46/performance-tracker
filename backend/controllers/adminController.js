const Organization = require('../models/Organization');
const Employee = require('../models/Employee');
const { sendOrganizationCredentials } = require('../utils/emailService');
const { generateRandomPassword, formatSuccessResponse, formatErrorResponse, removePasswordFromUser, capitalizeWords } = require('../utils/helpers');

// Create a new organization
const createOrganization = async (req, res) => {
  try {
    const { name, industry, location, email } = req.body;

    // Generate random password
    const password = generateRandomPassword();

    // Create organization data
    const organizationData = {
      name: capitalizeWords(name),
      industry: industry ? capitalizeWords(industry) : null,
      location: location ? capitalizeWords(location) : null,
      email: email.toLowerCase(),
      password
    };

    // Create organization in database
    const newOrganization = await Organization.create(organizationData);

    // Send credentials via email
    try {
      await sendOrganizationCredentials(newOrganization, password);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue execution but log the error
      // In production, you might want to queue this for retry
    }

    res.status(201).json(
      formatSuccessResponse({
        organization: newOrganization,
        message: 'Organization created successfully. Credentials sent to email.'
      }, 'Organization created successfully')
    );

  } catch (error) {
    console.error('Create organization error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json(
        formatErrorResponse('Organization with this email already exists', 409)
      );
    }

    res.status(500).json(
      formatErrorResponse('Internal server error while creating organization')
    );
  }
};

// Get all organizations
const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.getAllOrganizations();

    res.status(200).json(
      formatSuccessResponse({
        organizations,
        count: organizations.length
      }, 'Organizations retrieved successfully')
    );

  } catch (error) {
    console.error('Get all organizations error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching organizations')
    );
  }
};

// Get organization by ID
const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json(
        formatErrorResponse('Organization not found', 404)
      );
    }

    res.status(200).json(
      formatSuccessResponse({
        organization
      }, 'Organization retrieved successfully')
    );

  } catch (error) {
    console.error('Get organization by ID error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching organization')
    );
  }
};

// Update organization
const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry, location } = req.body;

    // Check if organization exists
    const existingOrganization = await Organization.findById(id);
    if (!existingOrganization) {
      return res.status(404).json(
        formatErrorResponse('Organization not found', 404)
      );
    }

    // Update organization data
    const updateData = {
      name: name ? capitalizeWords(name) : undefined,
      industry: industry ? capitalizeWords(industry) : undefined,
      location: location ? capitalizeWords(location) : undefined
    };

    const updatedOrganization = await Organization.updateOrganization(id, updateData);

    res.status(200).json(
      formatSuccessResponse({
        organization: updatedOrganization
      }, 'Organization updated successfully')
    );

  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while updating organization')
    );
  }
};

// Delete organization
const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if organization exists
    const existingOrganization = await Organization.findById(id);
    if (!existingOrganization) {
      return res.status(404).json(
        formatErrorResponse('Organization not found', 404)
      );
    }

    // Delete organization (this will cascade delete employees)
    await Organization.deleteOrganization(id);

    res.status(200).json(
      formatSuccessResponse({
        deletedOrganizationId: id
      }, 'Organization deleted successfully')
    );

  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while deleting organization')
    );
  }
};

// Get all employees (across all organizations)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.getAllEmployees();

    res.status(200).json(
      formatSuccessResponse({
        employees,
        count: employees.length
      }, 'All employees retrieved successfully')
    );

  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching employees')
    );
  }
};

// Get employees by organization
const getEmployeesByOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json(
        formatErrorResponse('Organization not found', 404)
      );
    }

    const employees = await Employee.getEmployeesByOrganization(organizationId);

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
    console.error('Get employees by organization error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching organization employees')
    );
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const organizations = await Organization.getAllOrganizations();
    const employees = await Employee.getAllEmployees();

    // Calculate basic statistics
    const stats = {
      totalOrganizations: organizations.length,
      totalEmployees: employees.length,
      averageEmployeesPerOrg: organizations.length > 0 ? (employees.length / organizations.length).toFixed(2) : 0,
      recentOrganizations: organizations.slice(0, 5), // Last 5 organizations
      recentEmployees: employees.slice(0, 10) // Last 10 employees
    };

    res.status(200).json(
      formatSuccessResponse(stats, 'Dashboard statistics retrieved successfully')
    );

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while fetching dashboard statistics')
    );
  }
};

module.exports = {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getAllEmployees,
  getEmployeesByOrganization,
  getDashboardStats
};