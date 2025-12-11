const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const organizationRoutes = require('./organization');
const employeeRoutes = require('./employee');
const activityRoutes = require('./activity');
const contactRoutes = require('./contact');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/organization', organizationRoutes);
router.use('/employee', employeeRoutes);
router.use('/activities', activityRoutes);
router.use('/contact', contactRoutes);

module.exports = router;