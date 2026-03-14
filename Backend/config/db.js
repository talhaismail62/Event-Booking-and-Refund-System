const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required to connect to Supabase securely
  }
});

pool.connect()
  .then(() => console.log('Successfully connected to Supabase PostgreSQL!'))
  .catch((err) => console.error('Database connection error:', err.stack));

module.exports = pool;