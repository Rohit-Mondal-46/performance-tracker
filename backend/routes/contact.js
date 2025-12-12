const express = require('express');
const router = express.Router();
const { submitContactRequest } = require('../controllers/contactController');

// POST /api/contact - Submit contact request (public route, no auth required)
router.post('/', submitContactRequest);

module.exports = router;
