const express = require('express');
const router = express.Router();
const {
  createPerformanceScore,
  getMyPerformanceScores,
  getEmployeePerformanceScores,
  getPerformanceTrends,
  getOrganizationAnalytics,
} = require('../controllers/performanceController');
const { verifyToken, requireAdmin, requireOrganization, requireEmployee } = require('../middleware/auth');
const { validatePerformanceScore } = require('../middleware/validation');


// Employee routes - Employees can manage their own performance scores
router.post('/employee/scores', verifyToken, requireEmployee, validatePerformanceScore, createPerformanceScore);
router.get('/employee/scores', verifyToken, requireEmployee, getMyPerformanceScores); 
router.get('/employee/trends', verifyToken, requireEmployee, getPerformanceTrends);

// Organization routes - Organizations can view their employees' performance scores
router.get('/organization/employees/:employeeId/scores', verifyToken, requireOrganization, getEmployeePerformanceScores); 
router.get('/organization/employees/:employeeId/trends', verifyToken, requireOrganization, getPerformanceTrends);
router.get('/organization/analytics', verifyToken, requireOrganization, getOrganizationAnalytics); 

// Admin routes - Admins can view all performance data
router.get('/admin/organizations/:organizationId/analytics', verifyToken, requireAdmin, getOrganizationAnalytics); 

module.exports = router;
