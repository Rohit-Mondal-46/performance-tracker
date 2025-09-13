const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getAllEmployees,
  getEmployeesByOrganization,
  getDashboardStats
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validateOrganizationCreation } = require('../middleware/validation');

// All admin routes require authentication and admin role
router.use(verifyToken, requireAdmin);

// Organization management
router.post('/organizations', validateOrganizationCreation, createOrganization);
router.get('/organizations', getAllOrganizations);
router.get('/organizations/:id', getOrganizationById);
router.put('/organizations/:id', updateOrganization);
router.delete('/organizations/:id', deleteOrganization);

// Employee management (admin can see all employees)
router.get('/employees', getAllEmployees);
router.get('/organizations/:organizationId/employees', getEmployeesByOrganization);

// Dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router;