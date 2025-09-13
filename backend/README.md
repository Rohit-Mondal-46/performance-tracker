# Performance Tracker Backend

A comprehensive Node.js backend system with JWT authentication, role-based access control, and email functionality for managing organizations and employees.

## 🚀 Features

- **Multi-Role Authentication**: Admin, Organization, and Employee roles with JWT
- **Email Integration**: Nodemailer with styled email templates
- **Database**: PostgreSQL with Neon DB support
- **Security**: Helmet, CORS, bcrypt password hashing
- **Role-Based Access Control**: Middleware-protected routes
- **Validation**: Express-validator for input validation
- **Error Handling**: Comprehensive error handling and logging

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # PostgreSQL connection
│   └── initDb.js            # Database initialization
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── adminController.js   # Admin management
│   ├── organizationController.js # Organization management
│   └── employeeController.js     # Employee management
├── middleware/
│   ├── auth.js              # JWT and role-based middleware
│   └── validation.js        # Input validation rules
├── models/
│   ├── Admin.js             # Admin model
│   ├── Organization.js      # Organization model
│   └── Employee.js          # Employee model
├── routes/
│   ├── index.js             # Main route handler
│   ├── auth.js              # Authentication routes
│   ├── admin.js             # Admin routes
│   ├── organization.js      # Organization routes
│   └── employee.js          # Employee routes
├── utils/
│   ├── emailService.js      # Email functionality
│   └── helpers.js           # Utility functions
├── .env                     # Environment variables
├── .gitignore              
├── package.json
└── index.js                 # Main application file
```

## 🔧 Setup Instructions

### 1. Environment Configuration

Update the `.env` file with your actual credentials:

```env
PORT=3000
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"

# Email Configuration (Gmail example)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="Performance Tracker <your-email@gmail.com>"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Database Setup

The database tables will be created automatically when the server starts. A default admin account will be created:

- **Email**: admin@performancetracker.com
- **Password**: admin123

## 📡 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/organization/login` - Organization login
- `POST /api/auth/employee/login` - Employee login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Admin Routes (Requires Admin Role)
- `GET /api/admin/dashboard` - Dashboard statistics
- `POST /api/admin/organizations` - Create organization
- `GET /api/admin/organizations` - List all organizations
- `GET /api/admin/organizations/:id` - Get organization by ID
- `PUT /api/admin/organizations/:id` - Update organization
- `DELETE /api/admin/organizations/:id` - Delete organization
- `GET /api/admin/employees` - List all employees
- `GET /api/admin/organizations/:orgId/employees` - Get organization employees

### Organization Routes (Requires Organization Role)
- `GET /api/organization/dashboard` - Organization dashboard
- `GET /api/organization/profile` - Get organization profile
- `PUT /api/organization/profile` - Update organization profile
- `POST /api/organization/employees` - Create employee
- `GET /api/organization/employees` - List organization employees
- `GET /api/organization/employees/:id` - Get employee by ID
- `PUT /api/organization/employees/:id` - Update employee
- `DELETE /api/organization/employees/:id` - Delete employee

### Employee Routes (Requires Employee Role)
- `GET /api/employee/dashboard` - Employee dashboard
- `GET /api/employee/profile` - Get employee profile
- `PUT /api/employee/profile` - Update employee profile
- `PUT /api/employee/change-password` - Change password
- `GET /api/employee/settings` - Get employee settings

## 🔐 Authentication Flow

### 1. Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@performancetracker.com",
    "password": "admin123"
  }'
```

### 2. Create Organization (Admin Only)
```bash
curl -X POST http://localhost:3000/api/admin/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Tech Solutions Inc",
    "industry": "Technology",
    "location": "New York",
    "email": "admin@techsolutions.com"
  }'
```

### 3. Organization Login
```bash
curl -X POST http://localhost:3000/api/auth/organization/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@techsolutions.com",
    "password": "GENERATED_PASSWORD_FROM_EMAIL"
  }'
```

### 4. Create Employee (Organization Only)
```bash
curl -X POST http://localhost:3000/api/organization/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ORG_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@techsolutions.com",
    "department": "Engineering",
    "position": "Software Developer"
  }'
```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

### Mailtrap Setup (Testing)
```env
EMAIL_HOST="smtp.mailtrap.io"
EMAIL_PORT="2525"
EMAIL_USER="your-mailtrap-user"
EMAIL_PASS="your-mailtrap-password"
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: Middleware-enforced permissions
- **Input Validation**: Express-validator for data sanitization
- **CORS Protection**: Configurable origin restrictions
- **Helmet**: Security headers and protections
- **Rate Limiting**: Can be added for production use

## 🗄️ Database Schema

### Admins Table
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  industry VARCHAR(100),
  location VARCHAR(150),
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Employees Table
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔍 Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Get Current User
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/auth/me
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
EMAIL_HOST="your-production-email-host"
EMAIL_USER="your-production-email"
EMAIL_PASS="your-production-email-password"
```

### Production Considerations
- Use environment-specific secrets
- Configure proper CORS origins
- Enable rate limiting
- Set up proper logging
- Use HTTPS in production
- Configure database connection pooling

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Success responses:
```json
{
  "success": true,
  "message": "Success message",
  "data": { /* response data */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**: Check DATABASE_URL and network connectivity
2. **Email Not Sending**: Verify EMAIL_* environment variables
3. **JWT Errors**: Ensure JWT_SECRET is set and tokens are valid
4. **CORS Issues**: Configure allowed origins in CORS settings

### Support

For issues and questions, please check the error logs and ensure all environment variables are properly configured.