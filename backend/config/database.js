
// config/database.js

// Load environment variables from .env file
require('dotenv').config();

const { Pool } = require('pg');

// --- Database Connection Configuration ---

// Determine the database connection string.
// Prioritizes NEON_DATABASE_URL but falls back to the standard DATABASE_URL.
const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("FATAL: Database connection string (NEON_DATABASE_URL or DATABASE_URL) is not set in the .env file.");
}

// Create a new Pool instance.
// A Pool manages multiple connections, which is much more efficient than creating a new one for every query.
const pool = new Pool({
  connectionString,
  
  // SSL configuration is required for NeonDB and most cloud database providers.
  // We explicitly allow it as Neon provides its own certificates.
  ssl: {
    rejectUnauthorized: false
  },
  
  // Optional: Tune pool settings based on your application's expected load.
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client can be idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
});

// --- Event Listeners for Logging ---

// Log when a new client is connected to the database.
pool.on('connect', (client) => {
  // This is a good place for detailed logging if needed, e.g., console.log('New client connected');
});

// This handles any unexpected errors on idle clients.
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // In a production environment, you might want more sophisticated error handling
  // than exiting the process, but this is a safe default for development.
  // process.exit(-1);
});

// --- Export a Clean Database Interface ---

/**
 * Executes a query using the connection pool.
 * @param {string} text - The SQL query string.
 * @param {Array} params - The parameters for the query.
 * @returns {Promise<Object>} - The result of the query.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Gets a single client from the pool. Use this for transactions.
 * @returns {Promise<Object>} - A client from the pool.
 */
const getClient = () => pool.connect();

/**
 * A simple function to test the database connection.
 * Can be called on server startup.
 */
const testConnection = async () => {
  try {
    const res = await query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Database connection error', err.stack);
    return false;
  }
};

module.exports = {
  query,
  getClient,
  testConnection,
  // Export the pool directly if advanced management is needed
  pool
};