const { sendServiceRequestToAdmin } = require('../utils/emailService');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/helpers');

// Handle contact request submission
const submitContactRequest = async (req, res) => {
  try {
    const { organizationName, email, industry, location } = req.body;

    // Validation
    if (!organizationName || !organizationName.trim()) {
      return res.status(400).json(
        formatErrorResponse('Organization name is required')
      );
    }

    if (!email || !email.trim()) {
      return res.status(400).json(
        formatErrorResponse('Email is required')
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(
        formatErrorResponse('Please provide a valid email address')
      );
    }

    // Prepare request data
    const requestData = {
      organizationName: organizationName.trim(),
      email: email.toLowerCase().trim(),
      industry: industry?.trim() || null,
      location: location?.trim() || null
    };

    // Send email to admin
    try {
      await sendServiceRequestToAdmin(requestData);
      
      console.log(`📧 New service request from ${requestData.organizationName} (${requestData.email})`);
      
      return res.status(200).json(
        formatSuccessResponse(
          { requestData },
          'Your request has been submitted successfully. We will contact you within 24 hours.'
        )
      );
    } catch (emailError) {
      console.error('❌ Failed to send service request email:', emailError);
      
      return res.status(500).json(
        formatErrorResponse('Failed to send request. Please try again later or contact us directly.')
      );
    }
  } catch (error) {
    console.error('❌ Error in submitContactRequest:', error);
    return res.status(500).json(
      formatErrorResponse('An unexpected error occurred. Please try again.')
    );
  }
};

module.exports = {
  submitContactRequest
};
