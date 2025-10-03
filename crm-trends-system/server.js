require('dotenv').config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const https = require("https");
const http = require("http");
const fs = require('fs');

const app = express();
const PORT = 3030; // Force port 3030 as requested

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// CORS for integration with main POS system
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// --- API Routes ---
const db = new sqlite3.Database('./crm-trends.db', (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Initialize database tables
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS calendar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date TEXT,
        description TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS sales_trends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        period TEXT,
        sales REAL,
        growth REAL
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS sales_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric TEXT,
        value REAL,
        date TEXT
      )`);

      // Insert sample data if tables are empty
      db.get("SELECT COUNT(*) as count FROM sales_trends", (err, row) => {
        if (!err && row.count === 0) {
          db.run("INSERT INTO sales_trends (period, sales, growth) VALUES ('2023-Q1', 10000, 5.2)");
          db.run("INSERT INTO sales_trends (period, sales, growth) VALUES ('2023-Q2', 12000, 20.0)");
          db.run("INSERT INTO sales_trends (period, sales, growth) VALUES ('2023-Q3', 15000, 25.0)");
        }
      });

      db.get("SELECT COUNT(*) as count FROM calendar_events", (err, row) => {
        if (!err && row.count === 0) {
          db.run("INSERT INTO calendar_events (title, date, description) VALUES ('Meeting', '2023-10-01', 'Team meeting')");
        }
      });

      db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
        if (!err && row.count === 0) {
          db.run("INSERT INTO customers (name, email, phone) VALUES ('John Doe', 'john@example.com', '123-456-7890')");
        }
      });

      db.get("SELECT COUNT(*) as count FROM sales_analytics", (err, row) => {
        if (!err && row.count === 0) {
          db.run("INSERT INTO sales_analytics (metric, value, date) VALUES ('Revenue', 50000, '2023-09-01')");
        }
      });
    });
  }
});

// Example API route: Get calendar events
app.get('/api/calendar/events', (req, res) => {
  db.all('SELECT * FROM calendar_events', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch calendar events' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/trends', (req, res) => {
  console.log('Received request for /api/trends');
  db.all('SELECT * FROM sales_trends', [], (err, rows) => {
    if (err) {
      console.error('Error querying sales_trends:', err);
      res.status(500).json({ error: 'Failed to fetch sales trends' });
    } else {
      console.log('sales_trends rows:', rows);
      res.json(rows);
    }
  });
});

// Example API route: Get customers
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch customers' });
    } else {
      res.json(rows);
    }
  });
});

// Example API route: Get sales analytics
app.get('/api/sales-analytics', (req, res) => {
  db.all('SELECT * FROM sales_analytics', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch sales analytics' });
    } else {
      res.json(rows);
    }
  });
});

// Serve React dashboard build files
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard/build')));

// Serve index.html for /dashboard and all subpaths to support React Router
app.use('/dashboard', (req, res, next) => {
  if (!req.path.includes('.')) {
    const indexPath = path.join(__dirname, 'dashboard/build/index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Dashboard build not found. Please run the build process.');
    }
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CRM Trends Analytics Server running at http://localhost:${PORT}`);
});

module.exports = app;
