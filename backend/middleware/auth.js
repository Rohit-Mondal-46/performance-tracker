const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Organization = require('../models/Organization');
const Employee = require('../models/Employee');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed.'
    });
  }
};

// Check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Verify admin still exists in database
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found. Please login again.'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying admin privileges.'
    });
  }
};

// Check if user is organization
const requireOrganization = async (req, res, next) => {
  try {
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Organization privileges required.'
      });
    }

    // Verify organization still exists in database
    const organization = await Organization.findById(req.user.id);
    if (!organization) {
      return res.status(401).json({
        success: false,
        message: 'Organization account not found. Please login again.'
      });
    }

    req.organization = organization;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying organization privileges.'
    });
  }
};

// Check if user is employee
const requireEmployee = async (req, res, next) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee privileges required.'
      });
    }

    // Verify employee still exists in database
    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Employee account not found. Please login again.'
      });
    }

    req.employee = employee;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying employee privileges.'
    });
  }
};

// Check if user is admin or organization (for certain shared endpoints)
const requireAdminOrOrganization = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Organization privileges required.'
      });
    }

    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user.id);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found. Please login again.'
        });
      }
      req.admin = admin;
    } else {
      const organization = await Organization.findById(req.user.id);
      if (!organization) {
        return res.status(401).json({
          success: false,
          message: 'Organization account not found. Please login again.'
        });
      }
      req.organization = organization;
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying privileges.'
    });
  }
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireOrganization,
  requireEmployee,
  requireAdminOrOrganization,
  generateToken
};
