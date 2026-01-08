const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const organizationRoutes = require('./organization');
const employeeRoutes = require('./employee');
const activityRoutes = require('./activity');
const inputActivityRoutes = require('./inputActivity');
const contactRoutes = require('./contact');
const screenshotsRouter = require('./screenshots');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/organization', organizationRoutes);
router.use('/employee', employeeRoutes);
router.use('/activities', activityRoutes);
router.use('/input-activity', inputActivityRoutes);
router.use('/contact', contactRoutes);
router.use('/screenshots', screenshotsRouter);

module.exports = router;