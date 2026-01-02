# VISTA - AI-Powered Performance Tracking System

<div align="center">

**A comprehensive performance tracking platform powered by AI computer vision**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)

[Features](#-key-features) • [Architecture](#-system-architecture) • [Installation](#-installation--setup) • [Usage](#-usage-guide) • [API Documentation](#-api-endpoints)

</div>

---

## 📖 Overview

**VISTA** is an intelligent performance tracking system that uses computer vision and AI to monitor employee productivity in real-time. The system captures activity data through webcam analysis, processes it using advanced AI models, and generates comprehensive performance analytics.

### How It Works

1. **🎥 Desktop Application**: Captures live webcam feed and analyzes user activities using MediaPipe and Face-API.js
2. **📊 Activity Detection**: Identifies activities like typing, writing, reading, phone usage, gesturing, and idle time
3. **📤 Data Transmission**: Sends 10-minute activity batches to the backend via secure API
4. **🔄 Backend Processing**: Processes raw activity data and calculates performance metrics
5. **📈 Analytics Generation**: Generates productivity scores, engagement metrics, and performance grades
6. **🖥️ Dashboard Visualization**: Displays comprehensive analytics through web-based dashboards

---

## 🎯 Key Features

### 🤖 AI-Powered Monitoring
- Real-time activity detection using MediaPipe Holistic and Face-API.js
- Gesture recognition and pose estimation
- Gaze tracking and face detection
- Privacy-first: All processing happens locally

### 📊 Comprehensive Analytics
- **Productivity Score**: Measures working time vs. idle time
- **Engagement Score**: Tracks focus levels and distraction patterns
- **Overall Performance**: Weighted combination of productivity and engagement
- **Performance Grades**: A, B, C, D, F rating system
- **Trend Analysis**: Daily, weekly, and monthly performance trends

### 👥 Multi-Role System
- **Admin**: System-wide management, organization creation
- **Organization**: Employee management, team analytics
- **Employee**: Personal performance tracking, self-improvement insights

### 🔒 Security & Privacy
- JWT-based authentication
- Role-based access control (RBAC)
- End-to-end encryption
- Local video processing (no video data stored)
- PostgreSQL with secure data handling

### 📧 Automated Workflows
- Email notifications for account creation
- Automated credential delivery
- Performance report generation

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VISTA Platform                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Desktop App     │       │   Backend API    │       │   Web Frontend   │
│  (Electron)      │◄─────►│   (Node.js)      │◄─────►│   (React)        │
│                  │       │                  │       │                  │
│  • MediaPipe     │       │  • Express.js    │       │  • Vite          │
│  • Face-API.js   │       │  • PostgreSQL    │       │  • TailwindCSS   │
│  • WebRTC        │       │  • JWT Auth      │       │  • Recharts      │
│  • Activity      │       │  • Scoring       │       │  • Lucide Icons  │
│    Tracking      │       │    Engine        │       │                  │
└──────────────────┘       └──────────────────┘       └──────────────────┘
        │                           │                           │
        │                           │                           │
        └───────────────────────────┴───────────────────────────┘
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │   PostgreSQL DB     │
                        │                     │
                        │  • Organizations    │
                        │  • Employees        │
                        │  • Activity Data    │
                        │  • Calculated       │
                        │    Scores           │
                        └─────────────────────┘
```

---

## 💻 Technology Stack

### Desktop Application
| Technology | Purpose |
|------------|---------|
| **Electron** | Cross-platform desktop framework |
| **React** | UI framework |
| **MediaPipe Holistic** | Pose, hand, and face detection |
| **Face-API.js** | Facial recognition and landmarks |
| **Vite** | Build tool and dev server |
| **TailwindCSS** | Styling |
| **Axios** | HTTP client |

### Backend API
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication |
| **Bcrypt** | Password hashing |
| **Nodemailer** | Email service |
| **Express-validator** | Input validation |

### Web Frontend
| Technology | Purpose |
|------------|---------|
| **React** | UI library |
| **Vite** | Build tool |
| **TailwindCSS** | Utility-first CSS |
| **Recharts** | Data visualization |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |

---

## 📁 Project Structure

```
performance-tracker/
├── backend/                 # Node.js API Server
│   ├── config/             # Database & initialization
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & validation
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── utils/             # Helper functions
│
├── frontend/               # React Web App
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable components
│       ├── contexts/      # React contexts
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── data/          # Static data
│
└── desktop-app/           # Electron Desktop App
    ├── electron/          # Main & preload scripts
    ├── public/            # Static assets & AI models
    └── src/
        ├── components/    # UI components
        ├── hooks/         # Custom hooks
        ├── services/      # API services
        └── utils/         # Helper functions
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**
- **SMTP Email Service** (Gmail, Mailtrap, etc.)

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your database and email credentials

# Initialize database
npm run init-db

# Start server
npm run dev
```

**Backend Environment Variables:**
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/performance_tracker"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="VISTA <your-email@gmail.com>"
```

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure API URL
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start development server
npm run dev
```

**Frontend Environment Variables:**
```env
VITE_API_URL=http://localhost:3000/api
```

### 3️⃣ Desktop App Setup

```bash
# Navigate to desktop-app directory
cd desktop-app

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start development
npm run dev

# Build for production
npm run build
```

**Desktop App Environment Variables:**
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📊 Database Schema

### Core Tables

#### `organizations`
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `industry` (VARCHAR)
- `location` (VARCHAR)
- `created_at` (TIMESTAMP)

#### `employees`
- `id` (UUID, Primary Key)
- `organization_id` (UUID, Foreign Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `department` (VARCHAR)
- `position` (VARCHAR)
- `created_at` (TIMESTAMP)

#### `raw_activity_intervals`
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key)
- `organization_id` (UUID, Foreign Key)
- `interval_start` (TIMESTAMP)
- `interval_end` (TIMESTAMP)
- `typing` (INTEGER) - seconds
- `writing` (INTEGER) - seconds
- `reading` (INTEGER) - seconds
- `phone` (INTEGER) - seconds
- `gesturing` (INTEGER) - seconds
- `looking_away` (INTEGER) - seconds
- `idle` (INTEGER) - seconds

#### `calculated_scores`
- `id` (UUID, Primary Key)
- `employee_id` (UUID, Foreign Key)
- `organization_id` (UUID, Foreign Key)
- `score_date` (DATE)
- `working_total` (INTEGER)
- `distracted_total` (INTEGER)
- `idle_total` (INTEGER)
- `grand_total` (INTEGER)
- `productivity_score` (DECIMAL)
- `engagement_score` (DECIMAL)
- `overall_score` (DECIMAL)
- `performance_grade` (VARCHAR)
- `interval_count` (INTEGER)
- `updated_at` (TIMESTAMP)

---

## 🔐 Authentication Flow

### 1. Admin Login
```bash
POST /api/auth/admin/login
{
  "email": "admin@performancetracker.com",
  "password": "admin123"
}
```

### 2. Create Organization (Admin Only)
```bash
POST /api/admin/organizations
Headers: { Authorization: "Bearer <admin_token>" }
{
  "name": "Tech Corp",
  "email": "admin@techcorp.com",
  "industry": "Technology",
  "location": "New York"
}
```

### 3. Organization Login
```bash
POST /api/auth/organization/login
{
  "email": "admin@techcorp.com",
  "password": "<password_from_email>"
}
```

### 4. Create Employee (Organization Only)
```bash
POST /api/organization/employees
Headers: { Authorization: "Bearer <org_token>" }
{
  "name": "John Doe",
  "email": "john@techcorp.com",
  "department": "Engineering",
  "position": "Software Engineer"
}
```

### 5. Employee Login (Desktop App)
```bash
POST /api/auth/employee/login
{
  "email": "john@techcorp.com",
  "password": "<password_from_email>"
}
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/organization/login` - Organization login
- `POST /api/auth/employee/login` - Employee login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `POST /api/admin/organizations` - Create organization
- `GET /api/admin/organizations` - List organizations
- `GET /api/admin/organizations/:id` - Get organization by ID
- `PUT /api/admin/organizations/:id` - Update organization
- `DELETE /api/admin/organizations/:id` - Delete organization
- `GET /api/admin/employees` - List all employees
- `GET /api/admin/organizations/:id/employees` - Get employees by organization

### Organization Routes
- `GET /api/organization/dashboard` - Dashboard data
- `GET /api/organization/analytics` - Team analytics
- `POST /api/organization/employees` - Create employee
- `GET /api/organization/employees` - List employees
- `GET /api/organization/employees/:id` - Get employee by ID
- `PUT /api/organization/employees/:id` - Update employee
- `GET /api/organization/employees/:id/performance` - Employee performance
- `DELETE /api/organization/employees/:id` - Delete employee

### Employee Routes
- `GET /api/employee/dashboard` - Personal dashboard
- `GET /api/employee/profile` - Profile information
- `PUT /api/employee/profile` - Update profile
- `PUT /api/employee/password` - Change password

### Activity Routes (Desktop App)
- `POST /api/activities/ingest` - Submit activity batch
- `GET /api/activities/scores` - Get calculated scores
- `GET /api/activities/daily-scores` - Get daily scores
- `GET /api/activities/trends` - Get performance trends
- `GET /api/activities/latest` - Get latest activity

### Contact Routes
- `POST /api/contact` - Submit contact form
- `GET /api/admin/contact-requests` - Get all contact requests (Admin)

---

## 🎮 Usage Guide

### For Administrators

1. **Login** to the admin dashboard
2. **Create Organizations** with industry and location details
3. **Monitor** system-wide statistics
4. **Manage** organizations and view employee counts
5. **Export** data for reporting

### For Organizations

1. **Login** with credentials received via email
2. **Create Employee Accounts** with department and position
3. **View Team Analytics** including:
   - Average performance scores
   - Grade distribution
   - Productivity trends
   - Engagement metrics
4. **Monitor Individual Employees** with detailed performance data
5. **Generate Reports** for performance reviews

### For Employees

1. **Download** and install the desktop application
2. **Login** with credentials received via email
3. **Grant Camera Permissions** for activity tracking
4. **Start Working** - the app tracks activities automatically
5. **View Performance** on the web dashboard:
   - Personal performance rating
   - Productivity and engagement scores
   - Performance trends
   - Improvement recommendations

---

## 📈 Performance Scoring System

### Activity Categories

#### Working Activities (Productive)
- **Typing**: Keyboard usage detection
- **Writing**: Hand writing movements
- **Reading**: Focused reading posture

#### Distracted Activities
- **Phone Usage**: Phone in hand detection
- **Gesturing**: Excessive hand movements
- **Looking Away**: Gaze direction tracking

#### Idle Activities
- **Idle Time**: No activity detected

### Score Calculation

```javascript
// Productivity Score (0-100)
productivity_score = (working_time / total_time) × 100 - (idle_time_penalty)

// Engagement Score (0-100)
engagement_score = 100 - (distraction_ratio × penalty) + consistency_bonus

// Overall Score (0-100)
overall_score = (productivity_score × 0.55) + (engagement_score × 0.45)
```

### Performance Grades
- **A (90-100)**: Exceptional performance
- **B (80-89)**: Strong performance
- **C (70-79)**: Satisfactory performance
- **D (60-69)**: Needs improvement
- **F (<60)**: Poor performance

---

## 🔧 Configuration

### Scoring Weights (Backend)

Edit `backend/utils/activityBasedScoring.js`:

```javascript
static WEIGHTS = {
  productivity: 0.55,        // 55% weight
  engagement: 0.45,          // 45% weight
  idle_penalty: 20,          // Idle penalty multiplier
  distracted_penalty: 35,    // Distraction penalty
  consistency_bonus: 5       // Focus consistency bonus
};
```

### Activity Tracking Interval (Desktop App)

Edit `desktop-app/src/hooks/useActivityTracking.js`:

```javascript
const INTERVAL_DURATION = 10 * 60 * 1000; // 10 minutes
```

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Failed**
```bash
# Check PostgreSQL is running
# Windows (in PowerShell as admin):
Get-Service postgresql*

# Start PostgreSQL if not running
Start-Service postgresql-x64-14

# Verify DATABASE_URL in .env
```

**Email Not Sending**
```bash
# Test email configuration
npm run test-email

# For Gmail, enable "Less secure app access"
# Or create an App Password
```

### Desktop App Issues

**Camera Not Working**
- Grant camera permissions in Windows Settings > Privacy > Camera
- Restart the application
- Check browser console for errors

**MediaPipe Not Loading**
```bash
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

**Activity Not Syncing**
- Check network connection
- Verify API_URL in .env
- Check backend server is running
- Review console logs for errors

### Frontend Issues

**API Connection Failed**
- Verify VITE_API_URL in .env
- Check backend server is running
- Check CORS configuration

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, random secrets
3. **Password Policy**: Enforce strong passwords
4. **HTTPS**: Use SSL/TLS in production
5. **Rate Limiting**: Implement API rate limiting
6. **Input Validation**: Validate all user inputs
7. **SQL Injection**: Use parameterized queries
8. **XSS Protection**: Sanitize user-generated content

---

## 📦 Production Deployment

### Backend Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Using PM2 (recommended)
npm install -g pm2
pm2 start index.js --name vista-backend
pm2 startup
pm2 save
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Serve with Nginx or deploy to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
```

### Desktop App Distribution

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

---

## 📊 Performance Metrics

### System Capabilities
- **Concurrent Users**: 1000+ simultaneous users
- **Activity Processing**: < 500ms per batch
- **Database Queries**: < 100ms average
- **API Response Time**: < 200ms
- **Real-time Updates**: WebSocket support ready

### Monitoring
- CPU usage tracking
- Memory optimization
- Database connection pooling
- Error logging and alerting

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👥 Team & Support

### Core Team
- **Project Lead**: Rohit Kumar
- **Backend Development**: Rohit Kumar
- **Frontend Development**: Rohit Kumar
- **Desktop App**: Rohit Kumar

### Support Channels
- 📧 Email: support@vistatracker.com
- 💬 Discord: Join our community
- 🐛 Issues: GitHub Issues
- 📖 Documentation: Full Documentation

---

## 🗺️ Roadmap

### Version 2.0 (Upcoming)
- [ ] Mobile app for iOS and Android
- [ ] Advanced AI models for better accuracy
- [ ] Team collaboration features
- [ ] Integration with project management tools
- [ ] Custom scoring algorithms per organization
- [ ] Blockchain-based report verification
- [ ] Multi-language support
- [ ] Dark mode for all platforms

### Version 2.1
- [ ] Screen recording (opt-in)
- [ ] Smart notifications
- [ ] Gamification features
- [ ] Advanced analytics dashboard
- [ ] Export to Excel/PDF
- [ ] API webhooks

---

## 🙏 Acknowledgments

- **MediaPipe** by Google - Pose and gesture detection
- **Face-API.js** - Facial recognition
- **PostgreSQL** - Robust database
- **React Community** - UI components
- **Electron** - Desktop framework
- **TailwindCSS** - Styling framework

---

## 📞 Contact

**VISTA Performance Tracker**

- Website: https://vistatracker.com
- Email: contact@vistatracker.com
- GitHub: https://github.com/yourusername/performance-tracker

---

<div align="center">

**Made with ❤️ by the VISTA Team**

⭐ Star us on GitHub if you find this project useful!

[Report Bug](https://github.com/yourusername/performance-tracker/issues) • [Request Feature](https://github.com/yourusername/performance-tracker/issues) • [Documentation](https://docs.vistatracker.com)

</div>