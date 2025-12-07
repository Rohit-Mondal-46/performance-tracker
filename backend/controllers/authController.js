const Admin = require('../models/Admin');
const Organization = require('../models/Organization');
const Employee = require('../models/Employee');
const { generateToken } = require('../middleware/auth');
const { formatSuccessResponse, formatErrorResponse, removePasswordFromUser } = require('../utils/helpers');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json(
        formatErrorResponse('Invalid credentials', 401)
      );
    }

    // Verify password
    const isPasswordValid = await Admin.verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        formatErrorResponse('Invalid credentials', 401)
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: 'admin'
    });

    // Remove password from response
    const adminData = removePasswordFromUser(admin);

    res.status(200).json(
      formatSuccessResponse({
        user: adminData,
        token,
        role: 'admin'
      }, 'Admin login successful')
    );

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error during login')
    );
  }
};

// Organization login
const organizationLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find organization by email
    const organization = await Organization.findByEmail(email);
    if (!organization) {
      return res.status(401).json(
        formatErrorResponse('Invalid credentials', 401)
      );
    }

    // Verify password
    const isPasswordValid = await Organization.verifyPassword(password, organization.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        formatErrorResponse('Invalid credentials', 401)
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: organization.id,
      email: organization.email,
      role: 'organization'
    });

    // Remove password from response
    const organizationData = removePasswordFromUser(organization);

    res.status(200).json(
      formatSuccessResponse({
        user: organizationData,
        token,
        role: 'hr_manager' // Map to hr_manager for frontend compatibility
      }, 'Organization login successful')
    );

  } catch (error) {
    console.error('Organization login error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error during login')
    );
  }
};

// Employee login
const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find employee by email
    const employee = await Employee.findByEmail(email);
    if (!employee) {
      return res.status(401).json(
        formatErrorResponse('Invalid credentials', 401)
      );
    }

    // Verify password
    const isPasswordValid = await Employee.verifyPassword(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        formatErrorResponse('Invalid credentials', 401)
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: employee.id,
      email: employee.email,
      role: 'employee',
      organizationId: employee.organization_id
    });

    // Remove password from response
    const employeeData = removePasswordFromUser(employee);

    res.status(200).json(
      formatSuccessResponse({
        user: employeeData,
        token,
        role: 'employee'
      }, 'Employee login successful')
    );

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error during login')
    );
  }
};

// Verify token and get current user
const getCurrentUser = async (req, res) => {
  try {
    const { role, id } = req.user;
    let userData;

    switch (role) {
      case 'admin':
        userData = await Admin.findById(id);
        break;
      case 'organization':
        userData = await Organization.findById(id);
        break;
      case 'employee':
        userData = await Employee.findById(id);
        break;
      default:
        return res.status(400).json(
          formatErrorResponse('Invalid user role', 400)
        );
    }

    if (!userData) {
      return res.status(404).json(
        formatErrorResponse('User not found', 404)
      );
    }

    const userWithoutPassword = removePasswordFromUser(userData);

    res.status(200).json(
      formatSuccessResponse({
        user: userWithoutPassword,
        role
      }, 'User data retrieved successfully')
    );

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error')
    );
  }
};

// Logout (client-side token removal, but we can track it here)
const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist tokens
    // For now, we'll just send a success response
    
    res.status(200).json(
      formatSuccessResponse(null, 'Logout successful')
    );

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error during logout')
    );
  }
};

module.exports = {
  adminLogin,
  organizationLogin,
  employeeLogin,
  getCurrentUser,
  logout
};