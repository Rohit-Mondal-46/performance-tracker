const express = require('express');
const router = express.Router();
const {
  generateDailyScore,
  getEmployeePerformance,
  getMyPerformance,
  recordActivity
} = require('../controllers/performanceController');
const { verifyToken, requireEmployee, requireAdmin } = require('../middleware/auth');

// Employee routes (require employee authentication)
router.use('/my', verifyToken, requireEmployee);
router.get('/my', getMyPerformance);
router.post('/my/activity', recordActivity);

// Admin routes (require admin authentication) 
router.use('/employee', verifyToken, requireAdmin);
router.post('/employee/:employeeId/daily', generateDailyScore);
router.get('/employee/:employeeId', getEmployeePerformance);

module.exports = router;