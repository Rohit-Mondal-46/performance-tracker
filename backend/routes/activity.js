const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

router.post('/ingest', activityController.ingestActivityBatch);
router.get('/scores', activityController.getMyCalculatedScores);
router.get('/daily-scores', activityController.getMyDailyScores);
router.get('/trends', activityController.getMyPerformanceTrends);
router.get('/latest', activityController.getMyLatestActivity);

module.exports = router;
