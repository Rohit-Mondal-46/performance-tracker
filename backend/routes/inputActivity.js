const express = require('express');
const router = express.Router();
const inputActivityController = require('../controllers/inputActivityController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// ============================================
// EMPLOYEE ROUTES
// ============================================


router.post('/ingest', inputActivityController.ingestInputActivity);

router.get('/intervals', inputActivityController.getMyInputIntervals);

router.get('/daily-stats', inputActivityController.getMyDailyInputStats);

router.get('/trends', inputActivityController.getMyInputTrends);

router.get('/latest', inputActivityController.getMyLatestInput);

router.get('/stats', inputActivityController.getMyInputStats);


router.get('/my-intervals-with-screenshots', inputActivityController.getMyInputWithScreenshots);

// ============================================
// ORGANIZATION ROUTES
// ============================================


router.get('/organization/comparison', inputActivityController.getOrganizationInputComparison);


router.get('/organization/intervals', inputActivityController.getOrganizationInputIntervals);


router.get('/organization/employee-intervals-with-screenshots', inputActivityController.getEmployeeInputWithScreenshots);

module.exports = router;
