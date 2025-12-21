const express = require("express");
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require("dotenv");
const { createTables } = require('./config/initDb');
const { testEmailConfiguration } = require('./utils/emailService');
const morgan = require('morgan');


dotenv.config();

const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));

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
    ? ['https://frontend-vista.vercel.app/'] 
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost']
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Performance Tracker API Server is up and running!",
    });
});

app.use('/api', apiRoutes);

app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  
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
    console.log('Initializing Vista Backend...');
    
    await createTables();
    
    const emailConfigValid = await testEmailConfiguration();
    if (!emailConfigValid) {
      console.log('Email configuration issue.');
    }
    
    app.listen(PORT, () => {
      console.log(`Server Started Successfully!, PORT:${PORT}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
   


