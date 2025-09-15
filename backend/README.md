# Performance Tracker Backend

A complete Node.js backend system with JWT authentication, role-based access control, and email notifications. The system supports three user roles: Admin, Organization, and Employee.

## 🚀 Features

- **JWT Authentication** with role-based access control
- **Three User Roles**: Admin, Organization, Employee
- **Email Service** with Nodemailer for credential delivery
- **PostgreSQL Database** with NeonDB integration
- **Password Hashing** with bcrypt
- **Input Validation** with express-validator
- **Security Middleware** with Helmet and CORS
- **Comprehensive Error Handling**

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (NeonDB recommended)
- SMTP email service (Gmail, Mailtrap, etc.)

## 🔧 Development

### File Structure
```
backend/
├── config/
│   ├── database.js          # Database connection
│   └── initDb.js           # Database initialization
├── controllers/
│   ├── adminController.js   # Admin business logic
│   ├── authController.js    # Authentication logic
│   ├── employeeController.js # Employee business logic
│   └── organizationController.js # Organization logic
├── middleware/
│   ├── auth.js             # JWT & role-based auth
│   └── validation.js       # Input validation
├── models/
│   ├── Admin.js            # Admin database model
│   ├── Employee.js         # Employee database model
│   └── Organization.js     # Organization database model
├── routes/
│   ├── admin.js            # Admin routes
│   ├── auth.js             # Authentication routes
│   ├── employee.js         # Employee routes
│   ├── index.js            # Route aggregator
│   └── organization.js     # Organization routes
├── utils/
│   ├── emailService.js     # Email sending service
│   └── helpers.js          # Utility functions
└── index.js                # Main application file
```






---





---

## 📞 Support

For issues and questions:
1. Check the error logs in the console
2. Verify environment variables are set correctly
3. Ensure database connection is working
4. Check email service configuration



*Built with Node.js, Express, PostgreSQL, JWT, and Nodemailer*

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








### Get Current User
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/auth/me
```




## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request



