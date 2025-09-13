// Generate a random password
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
  let password = '';
  
  // Ensure at least one character from each type
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '@#$%&*';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Format error response
const formatErrorResponse = (message, statusCode = 500, errors = null) => {
  return {
    success: false,
    message,
    statusCode,
    errors,
    timestamp: new Date().toISOString()
  };
};

// Format success response
const formatSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Remove password from user object
const removePasswordFromUser = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if string is UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Capitalize first letter of each word
const capitalizeWords = (str) => {
  if (!str) return str;
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Log request details (for debugging)
const logRequest = (req, message = '') => {
  console.log(`
    🔍 ${message}
    Method: ${req.method}
    URL: ${req.originalUrl}
    IP: ${req.ip}
    User-Agent: ${req.get('User-Agent')}
    Time: ${new Date().toISOString()}
  `);
};

module.exports = {
  generateRandomPassword,
  sanitizeInput,
  formatErrorResponse,
  formatSuccessResponse,
  removePasswordFromUser,
  isValidEmail,
  isValidUUID,
  capitalizeWords,
  logRequest
};