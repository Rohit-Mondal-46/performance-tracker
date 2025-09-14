const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const organizationRoutes = require('./organization');
const employeeRoutes = require('./employee');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/organization', organizationRoutes);
router.use('/employee', employeeRoutes);

module.exports = router;