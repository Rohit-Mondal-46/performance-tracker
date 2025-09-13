const express = require('express');
const router = express.Router();
const { adminLogin, organizationLogin, employeeLogin, getCurrentUser, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateAdminLogin, validateOrganizationLogin, validateEmployeeLogin } = require('../middleware/validation');

// Authentication routes
router.post('/admin/login', validateAdminLogin, adminLogin);
router.post('/organization/login', validateOrganizationLogin, organizationLogin);
router.post('/employee/login', validateEmployeeLogin, employeeLogin);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.post('/logout', verifyToken, logout);

module.exports = router;