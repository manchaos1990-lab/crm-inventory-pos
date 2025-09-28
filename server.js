require('dotenv').config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
// const fetch = require("node-fetch"); // Commented out due to compilation issues

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database setup ---
// Use /tmp for Render deployment (writable directory)
// Ensure cross-platform compatibility for database path
const dbPath = process.env.NODE_ENV === 'production'
  ? path.resolve('/tmp', 'app.db')
  : path.resolve(__dirname, "db", "app.db");

console.log("Database path:", dbPath);
console.log("__dirname:", __dirname);
console.log("Resolved __dirname:", path.resolve(__dirname));
console.log("process.env.NODE_ENV:", process.env.NODE_ENV);

// Ensure database directory exists in development
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📁 Created database directory: ${dbDir}`);
}

let db;
try {
  db = new sqlite3.Database(dbPath);
  console.log("✅ Connected to SQLite DB at:", dbPath);
} catch (err) {
  console.error("❌ Failed to connect to SQLite DB:", err.message);
  console.error("Database path:", dbPath);
  process.exit(1);
}

// Create tables if not exists
db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'user',
    approved INTEGER DEFAULT 1,
    device_id TEXT,
    last_sync DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    company TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    sub_category TEXT,
    sub_sub_category TEXT,
    more_category TEXT,
    price REAL NOT NULL,
    cost REAL,
    sku TEXT UNIQUE,
    barcode TEXT,
    stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    popularity INTEGER DEFAULT 0,
    notes TEXT,
    media_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    total_amount REAL NOT NULL,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    payment_method TEXT,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id)
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales (id),
    FOREIGN KEY (product_id) REFERENCES inventory (id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reference_id INTEGER,
    reference_type TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES inventory (id)
  );

  CREATE TABLE IF NOT EXISTS sync_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    data TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME
  );
`);

// Create default admin user if no users exist
db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
  if (err) {
    console.log("Error checking users:", err);
    return;
  }
  if (row.count === 0) {
    console.log("📝 Creating default admin user...");
    db.run("INSERT INTO users (username, password, name, role, approved) VALUES (?, ?, ?, ?, ?)",
      ["admin", "6964", "Administrator", "admin", 1],
      function(err) {
        if (err) {
          console.log("Error creating admin user:", err);
        } else {
          console.log("✅ Default admin user created: username='admin', password='6964'");
        }
      }
    );
  }
});

});

// --- Analytics Database setup ---
const analyticsDbPath = process.env.NODE_ENV === 'production'
  ? path.resolve('/tmp', 'analytics.db')
  : path.resolve(__dirname, "db", "analytics.db");

console.log("Analytics Database path:", analyticsDbPath);

const analyticsDbDir = path.dirname(analyticsDbPath);
if (!fs.existsSync(analyticsDbDir)) {
  fs.mkdirSync(analyticsDbDir, { recursive: true });
  console.log(`📁 Created analytics database directory: ${analyticsDbDir}`);
}

let analyticsDb;
try {
  analyticsDb = new sqlite3.Database(analyticsDbPath);
  console.log("✅ Connected to Analytics DB at:", analyticsDbPath);
} catch (err) {
  console.error("❌ Failed to connect to Analytics DB:", err.message);
  process.exit(1);
}

// Create analytics tables
analyticsDb.serialize(() => {
  analyticsDb.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_id INTEGER UNIQUE, -- ID from main POS system
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      company TEXT,
      notes TEXT,
      purpose_tags TEXT, -- JSON array of tags like ["snacks", "beverages"]
      total_purchases REAL DEFAULT 0,
      last_purchase_date DATETIME,
      preferred_products TEXT, -- JSON array of product IDs
      customer_segment TEXT DEFAULT 'new', -- new, regular, vip
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  analyticsDb.run(`
    CREATE TABLE IF NOT EXISTS sales_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_sale_id INTEGER UNIQUE, -- ID from main POS system
      customer_id INTEGER,
      total_amount REAL NOT NULL,
      items_count INTEGER,
      payment_method TEXT,
      sale_date DATETIME,
      products_purchased TEXT, -- JSON array of product details
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers (id)
    );
  `);

  analyticsDb.run(`
    CREATE TABLE IF NOT EXISTS product_trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER UNIQUE,
      product_name TEXT,
      category TEXT,
      total_sold INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0,
      popularity_score REAL DEFAULT 0,
      trend_direction TEXT DEFAULT 'stable', -- increasing, decreasing, stable
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  analyticsDb.run(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL, -- festival, promotion, holiday
      name TEXT NOT NULL,
      date DATE NOT NULL,
      impact_level TEXT DEFAULT 'medium', -- low, medium, high
      expected_demand_multiplier REAL DEFAULT 1.0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  analyticsDb.run(`
    CREATE TABLE IF NOT EXISTS demand_forecasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      forecast_date DATE,
      predicted_demand INTEGER,
      confidence_level REAL,
      factors TEXT, -- JSON array of influencing factors
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES product_trends (id)
    );
  `);
});

// --- Middleware ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Enhanced CORS for React Native app
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.194:3000', 'exp://192.168.0.194:19000', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Additional CORS headers for mobile app
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(
  session({
    secret: "crm-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 }, // 30 mins
  })
);

// --- Auth middleware ---
function requireLogin(req, res, next) {
  if (req.session.userId) return next();
  res.redirect("/login.html");
}

// --- Routes ---
// Root redirect
app.get("/", (req, res) => res.redirect("/login.html"));

// Signup
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(username, password);
    res.send("✅ User registered! Waiting for admin approval. <a href='/login.html'>Login</a>");
  } catch (err) {
    res.status(400).send("Username already exists.");
  }
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const stmt = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?");
  const row = stmt.get(username, password);
  if (row) {
    if (row.approved === 0) return res.status(403).send("⏳ Waiting for admin approval.");
    req.session.userId = row.id;
    req.session.username = row.username;
    req.session.role = row.role;
    if (row.role === "admin") return res.redirect("/admin.html");
    res.redirect("/dashboard.html");
  } else res.status(401).send("❌ Invalid credentials");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});

// --- Current user info ---
app.get("/api/me", requireLogin, (req, res) => {
  res.json({
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
  });
});

// --- Admin routes ---
app.get("/admin/users", requireLogin, (req, res) => {
  if (req.session.role !== "admin") return res.status(403).send("❌ Forbidden");
  const stmt = db.prepare("SELECT id, username, role, approved FROM users");
  res.json(stmt.all());
});

app.post("/admin/approve", requireLogin, (req, res) => {
  if (req.session.role !== "admin") return res.status(403).send("❌ Forbidden");
  const { userId } = req.body;
  try {
    const stmt = db.prepare("UPDATE users SET approved = 1 WHERE id = ?");
    stmt.run(userId);
    res.send("✅ User approved");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post("/admin/make-admin", requireLogin, (req, res) => {
  if (req.session.role !== "admin") return res.status(403).send("❌ Forbidden");
  const { userId } = req.body;
  try {
    const stmt = db.prepare("UPDATE users SET role = 'admin', approved = 1 WHERE id = ?");
    stmt.run(userId);
    res.send("✅ User promoted to admin");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// --- Serve HTML pages ---
app.get("/dashboard.html", requireLogin, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "dashboard.html"))
);
app.get("/crm.html", requireLogin, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "crm.html"))
);
app.get("/inventory.html", requireLogin, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "inventory.html"))
);
app.get("/pos.html", requireLogin, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "pos.html"))
);
app.get("/admin.html", requireLogin, (req, res) => {
  if (req.session.role !== "admin") return res.status(403).send("❌ Forbidden");
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// --- CRM APIs ---
app.get("/customers/all", requireLogin, (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM customers");
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/customers/add", requireLogin, (req, res) => {
  const { name, phone, email, address, notes } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO customers (name, phone, email, address, notes) VALUES (?, ?, ?, ?, ?)");
    const result = stmt.run(name, phone, email, address, notes);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Inventory APIs ---
app.get("/inventory/all", requireLogin, (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM inventory");
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/inventory/add", requireLogin, (req, res) => {
  const {
    name,
    category,
    sub_category,
    sub_sub_category,
    more_category,
    price,
    stock,
    popularity,
    notes,
    media_url,
  } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO inventory (name, category, sub_category, sub_sub_category, more_category, price, stock, popularity, notes, media_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const result = stmt.run(name, category, sub_category, sub_sub_category, more_category, price, stock, popularity, notes, media_url);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Sales APIs ---
app.get("/sales/all", requireLogin, (req, res) => {
  try {
    const stmt = db.prepare(`SELECT s.id, s.customer_id, s.product_id, s.quantity, s.total_amount, s.created_at as date,
      c.name AS customer_name, p.name AS product_name
     FROM sales s
     LEFT JOIN customers c ON s.customer_id = c.id
     LEFT JOIN inventory p ON s.product_id = p.id`);
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/sales/add", requireLogin, (req, res) => {
  const { customerId, items, total, paymentMethod, customer_id, product_id, quantity } = req.body;

  // Handle both old format (single item) and new format (multiple items)
  if (items && Array.isArray(items)) {
    // New format: multiple items in cart
    db.run(
      "INSERT INTO sales (customer_id, total_amount, payment_method) VALUES (?, ?, ?)",
      [customerId || null, total, paymentMethod || 'cash'],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });

        const saleId = this.lastID;
        let completed = 0;
        const totalItems = items.length;

        if (totalItems === 0) {
          return res.json({ id: saleId, success: true });
        }

        items.forEach(item => {
          db.run(
            "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
            [saleId, item.productId, item.quantity, item.unitPrice, item.totalPrice],
            function(err) {
              if (err) {
                console.error("Error adding sale item:", err);
              }
              completed++;
              if (completed === totalItems) {
                res.json({ id: saleId, success: true });
              }
            }
          );

          // Update stock
          db.run(
            "UPDATE inventory SET stock = stock - ? WHERE id = ?",
            [item.quantity, item.productId],
            function(err) {
              if (err) console.error("Error updating stock:", err);
            }
          );
        });
      }
    );
  } else {
    // Old format: single item sale
    db.get("SELECT price FROM inventory WHERE id=?", [product_id], (err, row) => {
      if (err) return res.status(500).send(err.message);
      if (!row) return res.status(400).send("❌ Invalid product");
      const itemTotal = row.price * quantity;
      db.run(
        "INSERT INTO sales (customer_id, total_amount, payment_method) VALUES (?, ?, ?)",
        [customer_id, itemTotal, 'cash'],
        function (err) {
          if (err) return res.status(500).send(err.message);
          res.json({ id: this.lastID, total: itemTotal });
        }
      );
    });
  }
});

// --- Additional API endpoints for React Native app ---

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- CRM Trends Integration ---
const CRM_TRENDS_URL = process.env.CRM_TRENDS_URL || 'http://localhost:3001';

// Sync customers to CRM Trends system
async function syncCustomersToCRM() {
  try {
    const customers = db.prepare("SELECT * FROM customers").all();
    if (customers.length === 0) return;

    // TODO: Implement fetch call when node-fetch is available
    console.log(`📊 Would sync ${customers.length} customers to CRM Trends at ${CRM_TRENDS_URL}`);
    // const response = await fetch(`${CRM_TRENDS_URL}/api/sync/customers`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ customers })
    // });
  } catch (error) {
    console.log(`❌ Error syncing customers to CRM Trends: ${error.message}`);
  }
}

// Sync sales to CRM Trends system
async function syncSalesToCRM() {
  try {
    const sales = db.prepare(`
      SELECT s.*, c.name as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.created_at >= datetime('now', '-1 day')
    `).all();

    if (sales.length === 0) return;

    // TODO: Implement fetch call when node-fetch is available
    console.log(`📊 Would sync ${sales.length} recent sales to CRM Trends at ${CRM_TRENDS_URL}`);
    // const response = await fetch(`${CRM_TRENDS_URL}/api/sync/sales`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ sales })
    // });
  } catch (error) {
    console.log(`❌ Error syncing sales to CRM Trends: ${error.message}`);
  }
}

// Get customer insights from CRM Trends
app.get("/api/crm/customer/:id/insights", async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement fetch call when node-fetch is available
    // For now, return mock data
    res.json({
      customerId: id,
      message: "CRM integration pending - node-fetch not available",
      preferredProducts: [],
      lastPurchase: null,
      totalPurchases: 0,
      purposeTags: [],
      segment: 'new'
    });

    // const response = await fetch(`${CRM_TRENDS_URL}/api/customers/${id}/insights`);
    // if (response.ok) {
    //   const insights = await response.json();
    //   res.json(insights);
    // } else if (response.status === 404) {
    //   res.json({ message: "Customer insights not available yet" });
    // } else {
    //   res.status(response.status).json({ error: "Failed to get customer insights" });
    // }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Additional API endpoints for React Native app ---

// Sync endpoint for mobile app
app.post("/api/sync", (req, res) => {
  const { deviceId, operations } = req.body;

  if (!deviceId || !operations || !Array.isArray(operations)) {
    return res.status(400).json({ error: "Invalid sync data" });
  }

  // Process each operation
  const results = [];
  let completed = 0;
  const total = operations.length;

  operations.forEach((operation, index) => {
    const { table, action, data, recordId } = operation;

    try {
      if (action === 'INSERT') {
        // Insert new record
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map(() => '?').join(', ');

        db.run(
          `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`,
          values,
          function(err) {
            if (err) {
              results[index] = { success: false, error: err.message };
            } else {
              results[index] = { success: true, id: this.lastID };
            }
            completed++;
            if (completed === total) {
              res.json({ results, synced: completed });
            }
          }
        );
      } else if (action === 'UPDATE') {
        // Update existing record
        const fields = Object.keys(data).filter(key => key !== 'id');
        const values = Object.values(data).filter((_, i) => Object.keys(data)[i] !== 'id');
        const setClause = fields.map(field => `${field} = ?`).join(', ');

        db.run(
          `UPDATE ${table} SET ${setClause} WHERE id = ?`,
          [...values, recordId],
          function(err) {
            if (err) {
              results[index] = { success: false, error: err.message };
            } else {
              results[index] = { success: true, changes: this.changes };
            }
            completed++;
            if (completed === total) {
              res.json({ results, synced: completed });
            }
          }
        );
      } else if (action === 'DELETE') {
        // Delete record
        db.run(
          `DELETE FROM ${table} WHERE id = ?`,
          [recordId],
          function(err) {
            if (err) {
              results[index] = { success: false, error: err.message };
            } else {
              results[index] = { success: true, changes: this.changes };
            }
            completed++;
            if (completed === total) {
              res.json({ results, synced: completed });
            }
          }
        );
      }
    } catch (error) {
      results[index] = { success: false, error: error.message };
      completed++;
      if (completed === total) {
        res.json({ results, synced: completed });
      }
    }
  });
});

// Get all data for initial sync
app.get("/api/sync/all", (req, res) => {
  try {
    const tables = ['users', 'customers', 'inventory', 'sales', 'sale_items', 'categories', 'suppliers', 'stock_movements'];
    const data = {};

    tables.forEach(table => {
      const stmt = db.prepare(`SELECT * FROM ${table}`);
      data[table] = stmt.all();
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sync status
app.get("/api/sync/status", (req, res) => {
  try {
    const stmt = db.prepare("SELECT COUNT(*) as pending FROM sync_operations WHERE status = 'pending'");
    const row = stmt.get();
    res.json({ pendingOperations: row.pending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mobile app specific endpoints
app.get("/api/mobile/dashboard", requireLogin, (req, res) => {
  // Get dashboard statistics
  try {
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM customers").get().count;
    const totalProducts = db.prepare("SELECT COUNT(*) as count FROM inventory WHERE is_active = 1").get().count;
    const totalSales = db.prepare("SELECT SUM(total_amount) as total FROM sales WHERE status = 'completed'").get().total || 0;
    const lowStockItems = db.prepare("SELECT COUNT(*) as count FROM inventory WHERE stock <= min_stock_level AND is_active = 1").get().count;

    res.json({
      totalCustomers,
      totalProducts,
      totalSales,
      lowStockItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products for POS
app.get("/api/mobile/products", requireLogin, (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM inventory WHERE is_active = 1 ORDER BY name");
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customers for CRM
app.get("/api/mobile/customers", requireLogin, (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM customers ORDER BY name");
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product (mobile)
app.post("/api/mobile/products", requireLogin, (req, res) => {
  const { name, price, stock, category, description, sku } = req.body;

  db.run(
    "INSERT INTO inventory (name, price, stock, category, description, sku) VALUES (?, ?, ?, ?, ?, ?)",
    [name, price, stock, category, description, sku],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
    }
  );
});

// Add customer (mobile)
app.post("/api/mobile/customers", requireLogin, (req, res) => {
  const { name, phone, email, address, company } = req.body;

  db.run(
    "INSERT INTO customers (name, phone, email, address, company) VALUES (?, ?, ?, ?, ?)",
    [name, phone, email, address, company],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
    }
  );
});

// Process sale (mobile)
app.post("/api/mobile/sales", requireLogin, (req, res) => {
  const { customerId, items, total, paymentMethod } = req.body;

  db.run(
    "INSERT INTO sales (customer_id, total, payment_method) VALUES (?, ?, ?)",
    [customerId, total, paymentMethod],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });

      const saleId = this.lastID;
      let completed = 0;
      const totalItems = items.length;

      if (totalItems === 0) {
        return res.json({ id: saleId, success: true });
      }

      items.forEach(item => {
        db.run(
          "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
          [saleId, item.productId, item.quantity, item.unitPrice, item.totalPrice],
          function(err) {
            if (err) {
              console.error("Error adding sale item:", err);
            }
            completed++;
            if (completed === totalItems) {
              res.json({ id: saleId, success: true });
            }
          }
        );

        // Update stock
        db.run(
          "UPDATE inventory SET stock = stock - ? WHERE id = ?",
          [item.quantity, item.productId],
          function(err) {
            if (err) console.error("Error updating stock:", err);
          }
        );
      });
    }
  );
});

// Update stock (mobile)
app.put("/api/mobile/products/:id/stock", requireLogin, (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  db.run(
    "UPDATE inventory SET stock = ? WHERE id = ?",
    [stock, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, changes: this.changes });
    }
  );
});

// --- Analytics API Routes ---

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CRM Trends Analytics",
    timestamp: new Date().toISOString()
  });
});

// Sync customer data from main POS system
app.post("/api/sync/customers", (req, res) => {
  const { customers } = req.body;
  if (!customers || !Array.isArray(customers)) {
    return res.status(400).json({ error: "Invalid customer data" });
  }

  let synced = 0;
  let errors = [];
  customers.forEach(customer => {
    try {
      const stmt = analyticsDb.prepare(`
        INSERT OR REPLACE INTO customers
        (original_id, name, phone, email, address, company, notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        customer.id,
        customer.name,
        customer.phone,
        customer.email,
        customer.address,
        customer.company,
        customer.notes
      );
      synced++;
    } catch (err) {
      errors.push({ customer: customer.id, error: err.message });
    }
  });
  res.json({
    success: true,
    synced,
    errors,
    total: customers.length
  });
});

// Sync sales data
app.post("/api/sync/sales", (req, res) => {
  const { sales } = req.body;
  if (!sales || !Array.isArray(sales)) {
    return res.status(400).json({ error: "Invalid sales data" });
  }

  let synced = 0;
  let errors = [];
  sales.forEach(sale => {
    try {
      const stmt = analyticsDb.prepare(`
        INSERT OR REPLACE INTO sales_analytics
        (original_sale_id, customer_id, total_amount, items_count, payment_method, sale_date, products_purchased)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        sale.id,
        sale.customer_id,
        sale.total_amount,
        sale.items_count || 1,
        sale.payment_method,
        sale.created_at,
        JSON.stringify(sale.products_purchased || [])
      );
      synced++;
    } catch (err) {
      errors.push({ sale: sale.id, error: err.message });
    }
  });
  res.json({
    success: true,
    synced,
    errors,
    total: sales.length
  });
});

// Get customers
app.get("/api/customers", (req, res) => {
  try {
    const stmt = analyticsDb.prepare("SELECT * FROM customers ORDER BY name");
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sales analytics
app.get("/api/sales-analytics", (req, res) => {
  try {
    const stmt = analyticsDb.prepare(`
      SELECT
        strftime('%Y-%m', sale_date) as month,
        COUNT(*) as sales_count,
        SUM(total_amount) as total_revenue
      FROM sales_analytics
      GROUP BY strftime('%Y-%m', sale_date)
      ORDER BY month DESC
      LIMIT 12
    `);
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product trends
app.get("/api/trends", (req, res) => {
  try {
    const stmt = analyticsDb.prepare(`
      SELECT
        pt.product_name,
        pt.category,
        pt.total_sold,
        pt.revenue,
        pt.popularity_score,
        pt.trend_direction
      FROM product_trends pt
      ORDER BY pt.popularity_score DESC
      LIMIT 10
    `);
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get calendar events
app.get("/api/calendar", (req, res) => {
  try {
    const stmt = analyticsDb.prepare("SELECT * FROM calendar_events ORDER BY date");
    res.json(stmt.all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Serve Dashboard ---
app.use('/dashboard', express.static(path.join(__dirname, 'public', 'dashboard')));

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📱 Mobile app can connect via: http://192.168.0.194:${PORT}`);
  console.log(`🌐 Web interface: http://192.168.0.194:${PORT}`);
  console.log(`📡 Network access: http://192.168.0.194:${PORT}`);
});
