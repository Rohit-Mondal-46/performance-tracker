const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // For development only
    }
  });
};

// Email templates
const getEmailTemplate = (type, data) => {
  const baseStyle = `
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  `;

  switch (type) {
    case 'organization_credentials':
      return `
        <html>
          <head><style>${baseStyle}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏢 Welcome to Performance Tracker</h1>
                <p>Your organization account has been created</p>
              </div>
              <div class="content">
                <h2>Hello ${data.name}!</h2>
                <p>Your organization account has been successfully created in our Performance Tracker system.</p>
                
                <div class="credentials">
                  <h3>🔐 Your Login Credentials</h3>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Password:</strong> ${data.password}</p>
                  <p><strong>Role:</strong> Organization</p>
                </div>
                
                <p>You can now log in to manage your employees and track their performance.</p>
                
                <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                
                <div class="footer">
                  <p>Best regards,<br>Performance Tracker Team</p>
                  <p>This is an automated message. Please do not reply to this email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

    case 'employee_credentials':
      return `
        <html>
          <head><style>${baseStyle}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>👤 Welcome to Performance Tracker</h1>
                <p>Your employee account has been created</p>
              </div>
              <div class="content">
                <h2>Hello ${data.name}!</h2>
                <p>Your employee account has been created by <strong>${data.organizationName}</strong> in our Performance Tracker system.</p>
                
                <div class="credentials">
                  <h3>🔐 Your Login Credentials</h3>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Password:</strong> ${data.password}</p>
                  <p><strong>Role:</strong> Employee</p>
                  <p><strong>Department:</strong> ${data.department || 'Not specified'}</p>
                  <p><strong>Position:</strong> ${data.position || 'Not specified'}</p>
                </div>
                
                <p>You can now log in to access your profile and performance tracking features.</p>
                
                <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                
                <div class="footer">
                  <p>Best regards,<br>Performance Tracker Team</p>
                  <p>This is an automated message. Please do not reply to this email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

    default:
      return `
        <html>
          <head><style>${baseStyle}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Performance Tracker</h1>
              </div>
              <div class="content">
                <p>Hello!</p>
                <p>This is a notification from Performance Tracker.</p>
              </div>
            </div>
          </body>
        </html>
      `;
  }
};

// Send organization credentials
const sendOrganizationCredentials = async (organizationData, password) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: organizationData.email,
      subject: '🏢 Your Organization Account - Performance Tracker',
      html: getEmailTemplate('organization_credentials', {
        name: organizationData.name,
        email: organizationData.email,
        password: password
      })
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Organization credentials sent to ${organizationData.email}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending organization credentials:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send employee credentials
const sendEmployeeCredentials = async (employeeData, password, organizationName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: employeeData.email,
      subject: '👤 Your Employee Account - Performance Tracker',
      html: getEmailTemplate('employee_credentials', {
        name: employeeData.name,
        email: employeeData.email,
        password: password,
        department: employeeData.department,
        position: employeeData.position,
        organizationName: organizationName
      })
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Employee credentials sent to ${employeeData.email}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending employee credentials:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendOrganizationCredentials,
  sendEmployeeCredentials,
  testEmailConfiguration
};