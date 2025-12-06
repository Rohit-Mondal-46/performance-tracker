const { body, validationResult } = require('express-validator');

// Error handler for validation
const handleValidationErrors = (req, res, next) => {
  console.log('Request body:', req.body); // Debug log
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Debug log
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Admin validation rules
const validateAdminLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Organization validation rules
const validateOrganizationCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Organization name must be between 2 and 150 characters'),
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Industry must be less than 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location must be less than 150 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

const validateOrganizationLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Employee validation rules
const validateEmployeeCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Employee name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position must be less than 100 characters'),
  handleValidationErrors
];

const validateEmployeeLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateEmployeeUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Employee name must be between 2 and 100 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position must be less than 100 characters'),
  handleValidationErrors
];

// Performance Score validation rules
const validatePerformanceScore = [
  body('workingTime')
    .notEmpty()
    .withMessage('Working time is required')
    .isNumeric()
    .withMessage('Working time must be a valid number')
    .custom(value => {
      const num = Number(value);
      if (num < 0 || num > 1440) {
        throw new Error('Working time must be between 0 and 1440 minutes per day');
      }
      return true;
    }),
  body('idleTime')
    .notEmpty()
    .withMessage('Idle time is required')
    .isNumeric()
    .withMessage('Idle time must be a valid number')
    .custom(value => {
      const num = Number(value);
      if (num < 0 || num > 1440) {
        throw new Error('Idle time must be between 0 and 1440 minutes per day');
      }
      return true;
    }),
  body('absentTime')
    .notEmpty()
    .withMessage('Absent time is required')
    .isNumeric()
    .withMessage('Absent time must be a valid number')
    .custom(value => {
      const num = Number(value);
      if (num < 0 || num > 1440) {
        throw new Error('Absent time must be between 0 and 1440 minutes per day');
      }
      return true;
    }),
  body('distractedTime')
    .notEmpty()
    .withMessage('Distracted time is required')
    .isNumeric()
    .withMessage('Distracted time must be a valid number')
    .custom(value => {
      const num = Number(value);
      if (num < 0 || num > 1440) {
        throw new Error('Distracted time must be between 0 and 1440 minutes per day');
      }
      return true;
    }),
  body('scoreDate')
    .optional()
    .isISO8601()
    .withMessage('Score date must be a valid date in ISO format (YYYY-MM-DD)'),
  handleValidationErrors
];

module.exports = {
  validateAdminLogin,
  validateOrganizationCreation,
  validateOrganizationLogin,
  validateEmployeeCreation,
  validateEmployeeLogin,
  validateEmployeeUpdate,
  validatePerformanceScore,
  handleValidationErrors
};