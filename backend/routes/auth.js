const express = require('express');
const router = express.Router();
const { 
  adminLogin, 
  organizationLogin, 
  employeeLogin, 
  getCurrentUser, 
  logout,
  employeeForgotPassword,
  organizationForgotPassword,
  employeeResetPassword,
  organizationResetPassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateAdminLogin, validateOrganizationLogin, validateEmployeeLogin } = require('../middleware/validation');

router.post('/admin/login', validateAdminLogin, adminLogin);
router.post('/organization/login', validateOrganizationLogin, organizationLogin);
router.post('/employee/login', validateEmployeeLogin, employeeLogin);
router.get('/me', verifyToken, getCurrentUser);
router.post('/logout', verifyToken, logout);

// Forgot password routes
router.post('/employee/forgot-password', employeeForgotPassword);
router.post('/organization/forgot-password', organizationForgotPassword);

// Reset password routes
router.post('/employee/reset-password', employeeResetPassword);
router.post('/organization/reset-password', organizationResetPassword);

module.exports = router;