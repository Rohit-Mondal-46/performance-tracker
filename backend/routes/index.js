const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const organizationRoutes = require('./organization');
const employeeRoutes = require('./employee');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Performance Tracker API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/organization', organizationRoutes);
router.use('/employee', employeeRoutes);

module.exports = router;