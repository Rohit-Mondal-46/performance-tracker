const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const organizationRoutes = require('./organization');
const employeeRoutes = require('./employee');
const performanceRoutes = require('./performance');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/organization', organizationRoutes);
router.use('/employee', employeeRoutes);
router.use('/performance', performanceRoutes);

module.exports = router;