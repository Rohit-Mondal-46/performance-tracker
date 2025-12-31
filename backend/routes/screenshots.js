const express = require('express');
const router = express.Router();
const { uploadScreenshot, getTodayScreenshots, getUserTodayScreenshots } = require('../controllers/screenshotsController');
const { verifyToken, requireEmployee, requireOrganization } = require('../middleware/auth');

// POST /api/screenshots/upload
router.post('/upload', verifyToken, requireEmployee, uploadScreenshot);

// GET /api/screenshots/today (Employee)
router.get('/', verifyToken, requireEmployee, getTodayScreenshots);

// GET /api/screenshots/user/:userId/today (Organization)
router.get('/user/:userId', verifyToken, requireOrganization, getUserTodayScreenshots);

module.exports = router;
