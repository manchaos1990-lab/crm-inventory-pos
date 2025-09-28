const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database path inside /db/app.db
const dbPath = path.resolve(__dirname, "../db/app.db");

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Could not connect to database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database.");
  }
});

// Create Products table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0
    )
  `);
  console.log("📦 Products table ready.");
});

module.exports = db;
