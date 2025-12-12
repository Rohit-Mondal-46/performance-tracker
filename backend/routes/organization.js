const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/organizationController');
const { verifyToken, requireOrganization } = require('../middleware/auth');
const { validateEmployeeCreation, validateEmployeeUpdate } = require('../middleware/validation');

// All organization require authentication and organization role
router.use(verifyToken, requireOrganization);

// Employee management
router.post('/employees', validateEmployeeCreation, createEmployee);
router.get('/employees', getMyEmployees);
router.get('/employees/:id', getEmployeeById);
router.put('/employees/:id', validateEmployeeUpdate, updateEmployee);
router.delete('/employees/:id', deleteEmployee);

// Employee performance (organization viewing employee data)
router.get('/employees/:id/scores', getEmployeePerformanceScores);
router.get('/employees/:id/trends', getEmployeePerformanceTrends);

// Organization profile management
router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

// Dashboard & Analytics
router.get('/dashboard', getOrganizationDashboard);
router.get('/analytics', getOrganizationAnalytics);

module.exports = router;