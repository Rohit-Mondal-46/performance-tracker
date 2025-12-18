const Admin = require('../models/Admin');
const Organization = require('../models/Organization');
const Employee = require('../models/Employee');
const { generateToken } = require('../middleware/auth');
const { formatSuccessResponse, formatErrorResponse, removePasswordFromUser } = require('../utils/helpers');
const { sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

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
        role: 'organization'
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

// ========================
// FORGOT PASSWORD & RESET PASSWORD
// ========================

// Request password reset - Employee
const employeeForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        formatErrorResponse('Email is required', 400)
      );
    }

    // Find employee by email
    const employee = await Employee.findByEmail(email);
    if (!employee) {
      // Don't reveal if email exists for security
      return res.status(200).json(
        formatSuccessResponse(null, 'If the email exists, a password reset link has been sent')
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await Employee.setResetToken(email, resetToken, resetTokenExpiry);

    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&type=employee`;
    await sendPasswordResetEmail(email, employee.name, resetLink, 'Employee');

    res.status(200).json(
      formatSuccessResponse(null, 'If the email exists, a password reset link has been sent')
    );

  } catch (error) {
    console.error('Employee forgot password error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while processing password reset request')
    );
  }
};

// Request password reset - Organization
const organizationForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        formatErrorResponse('Email is required', 400)
      );
    }

    // Find organization by email
    const organization = await Organization.findByEmail(email);
    if (!organization) {
      // Don't reveal if email exists for security
      return res.status(200).json(
        formatSuccessResponse(null, 'If the email exists, a password reset link has been sent')
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await Organization.setResetToken(email, resetToken, resetTokenExpiry);

    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&type=organization`;
    await sendPasswordResetEmail(email, organization.name, resetLink, 'Organization');

    res.status(200).json(
      formatSuccessResponse(null, 'If the email exists, a password reset link has been sent')
    );

  } catch (error) {
    console.error('Organization forgot password error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while processing password reset request')
    );
  }
};

// Reset password - Employee
const employeeResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json(
        formatErrorResponse('Token and new password are required', 400)
      );
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        formatErrorResponse('Password must be at least 6 characters long', 400)
      );
    }

    // Find employee by reset token
    const employee = await Employee.findByResetToken(token);
    if (!employee) {
      return res.status(400).json(
        formatErrorResponse('Invalid or expired reset token', 400)
      );
    }

    // Update password
    await Employee.updatePasswordByEmail(employee.email, newPassword);

    // Clear reset token
    await Employee.clearResetToken(employee.id);

    res.status(200).json(
      formatSuccessResponse(null, 'Password reset successful. You can now log in with your new password.')
    );

  } catch (error) {
    console.error('Employee reset password error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while resetting password')
    );
  }
};

// Reset password - Organization
const organizationResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json(
        formatErrorResponse('Token and new password are required', 400)
      );
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        formatErrorResponse('Password must be at least 6 characters long', 400)
      );
    }

    // Find organization by reset token
    const organization = await Organization.findByResetToken(token);
    if (!organization) {
      return res.status(400).json(
        formatErrorResponse('Invalid or expired reset token', 400)
      );
    }

    // Update password
    await Organization.updatePasswordByEmail(organization.email, newPassword);

    // Clear reset token
    await Organization.clearResetToken(organization.id);

    res.status(200).json(
      formatSuccessResponse(null, 'Password reset successful. You can now log in with your new password.')
    );

  } catch (error) {
    console.error('Organization reset password error:', error);
    res.status(500).json(
      formatErrorResponse('Internal server error while resetting password')
    );
  }
};

module.exports = {
  adminLogin,
  organizationLogin,
  employeeLogin,
  getCurrentUser,
  logout,
  employeeForgotPassword,
  organizationForgotPassword,
  employeeResetPassword,
  organizationResetPassword
};