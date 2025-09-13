const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getMyEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
  updateMyProfile,
  getOrganizationDashboard
} = require('../controllers/organizationController');
const { verifyToken, requireOrganization } = require('../middleware/auth');
const { validateEmployeeCreation, validateEmployeeUpdate } = require('../middleware/validation');

// All organization routes require authentication and organization role
router.use(verifyToken, requireOrganization);

// Employee management
router.post('/employees', validateEmployeeCreation, createEmployee);
router.get('/employees', getMyEmployees);
router.get('/employees/:id', getEmployeeById);
router.put('/employees/:id', validateEmployeeUpdate, updateEmployee);
router.delete('/employees/:id', deleteEmployee);

// Organization profile management
router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

// Dashboard
router.get('/dashboard', getOrganizationDashboard);

module.exports = router;