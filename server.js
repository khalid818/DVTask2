// server.js
const express = require('express');
const sql = require('mssql');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
    enableArithAbort: true
  }
};

// Connect to MSSQL
sql.connect(dbConfig, (err) => {
  if (err) {
      console.error('Error connecting to the database:', err);
      return;
  }
  console.log('Connected to the database');
});

// Serve the static HTML file
app.use(express.static(path.join(__dirname, 'public')));

// Route to fetch the latest command
app.get('/latest', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query('SELECT TOP 1 command FROM commands ORDER BY id DESC');
        const latestCommand = result.recordset[0]?.command || 'No command found';
        res.json({ success: true, command: latestCommand });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ success: false, message: 'Error fetching latest command' });
    }
});

app.get('/', (req, res) => {
  res.redirect('/latest');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});