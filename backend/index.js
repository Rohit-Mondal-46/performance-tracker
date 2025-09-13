const express = require("express");
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require("dotenv");
const { createTables } = require('./config/initDb');
const { testEmailConfiguration } = require('./utils/emailService');

dotenv.config();

const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 Performance Tracker API Server is up and running!",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            api: "/api",
            health: "/api/health",
            auth: "/api/auth",
            admin: "/api/admin",
            organization: "/api/organization",
            employee: "/api/employee"
        }
    });
});

app.use('/api', apiRoutes);

app.use((error, req, res, next) => {
  console.error('❌ Global Error Handler:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const startServer = async () => {
  try {
    console.log('🔄 Initializing Performance Tracker Backend...');
    
    await createTables();
    
    const emailConfigValid = await testEmailConfiguration();
    if (!emailConfigValid) {
      console.log('⚠️  Email configuration issue detected. Please check EMAIL_* environment variables.');
    }
    
    app.listen(PORT, () => {
      console.log(`
🎉 Performance Tracker Backend Started Successfully!
🌐 Server: http://localhost:${PORT}
📡 API: http://localhost:${PORT}/api
🏥 Health: http://localhost:${PORT}/api/health
🔐 Environment: ${process.env.NODE_ENV || 'development'}
📧 Email Service: ${emailConfigValid ? 'Configured ✅' : 'Not Configured ❌'}



🔑 Default Admin Credentials:
   Email: admin@performancetracker.com
   Password: admin123

      `);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
   


