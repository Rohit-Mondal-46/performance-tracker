const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getEmployeeDashboard,
  getMySettings
} = require('../controllers/employeeController');
const { verifyToken, requireEmployee } = require('../middleware/auth');
const { validateEmployeeUpdate } = require('../middleware/validation');

// All employee require authentication and employee role
router.use(verifyToken, requireEmployee);

// Employee profile management
router.get('/profile', getMyProfile);
router.put('/profile', validateEmployeeUpdate, updateMyProfile);

// Password management
router.put('/change-password', changePassword);

// Dashboard and settings
router.get('/dashboard', getEmployeeDashboard);
router.get('/settings', getMySettings);

module.exports = router;