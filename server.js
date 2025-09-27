require('dotenv').config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database setup ---
// Use /tmp for Render deployment (writable directory)
const dbPath = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'app.db')
  : path.join(__dirname, "db", "app.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB error:", err.message);
  else console.log("✅ Connected to SQLite DB at:", dbPath);
});

// Create tables if not exists
db.serialize(() => {
  // Users table (enhanced for mobile app)
  db.run(`CREATE TABLE IF NOT EXISTS users (
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
  )`);

  // Customers table (enhanced)
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    company TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Products/Inventory table (enhanced)
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
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
  )`);

  // Sales table (enhanced)
  db.run(`CREATE TABLE IF NOT EXISTS sales (
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
  )`);

  // Sale items table
  db.run(`CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales (id),
    FOREIGN KEY (product_id) REFERENCES inventory (id)
  )`);

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Suppliers table
  db.run(`CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Stock movements table
  db.run(`CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
    quantity INTEGER NOT NULL,
    reference_id INTEGER, -- sale_id, purchase_order_id, etc.
    reference_type TEXT, -- 'sale', 'purchase', 'adjustment'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES inventory (id)
  )`);

  // Sync operations table
  db.run(`CREATE TABLE IF NOT EXISTS sync_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    data TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME
  )`);

  // Create default admin user if no users exist
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (!err && row.count === 0) {
      console.log("📝 Creating default admin user...");
      db.run(
        "INSERT INTO users (username, password, name, role, approved) VALUES (?, ?, ?, ?, ?)",
        ["admin", "admin123", "Administrator", "admin", 1],
        function(err) {
          if (err) {
            console.error("❌ Error creating default admin:", err.message);
          } else {
            console.log("✅ Default admin user created: username='admin', password='admin123'");
          }
        }
      );
    }
  });
});

// --- Middleware ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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
  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    function (err) {
      if (err) return res.status(400).send("Username already exists.");
      res.send("✅ User registered! Waiting for admin approval. <a href='/login.html'>Login</a>");
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (row) {
        if (row.approved === 0) return res.status(403).send("⏳ Waiting for admin approval.");
        req.session.userId = row.id;
        req.session.username = row.username;
        req.session.role = row.role;
        if (row.role === "admin") return res.redirect("/admin.html");
        res.redirect("/dashboard.html");
      } else res.status(401).send("❌ Invalid credentials");
    }
  );
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
  db.all("SELECT id, username, role, approved FROM users", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.post("/admin/approve", requireLogin, (req, res) => {
  if (req.session.role !== "admin") return res.status(403).send("❌ Forbidden");
  const { userId } = req.body;
  db.run("UPDATE users SET approved = 1 WHERE id = ?", [userId], function (err) {
    if (err) return res.status(400).send(err.message);
    res.send("✅ User approved");
  });
});

app.post("/admin/make-admin", requireLogin, (req, res) => {
  if (req.session.role !== "admin") return res.status(403).send("❌ Forbidden");
  const { userId } = req.body;
  db.run("UPDATE users SET role = 'admin', approved = 1 WHERE id = ?", [userId], function (err) {
    if (err) return res.status(400).send(err.message);
    res.send("✅ User promoted to admin");
  });
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
  db.all("SELECT * FROM customers", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.post("/customers/add", requireLogin, (req, res) => {
  const { name, phone, email, address, notes } = req.body;
  db.run(
    "INSERT INTO customers (name, phone, email, address, notes) VALUES (?, ?, ?, ?, ?)",
    [name, phone, email, address, notes],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID });
    }
  );
});

// --- Inventory APIs ---
app.get("/inventory/all", requireLogin, (req, res) => {
  db.all("SELECT * FROM inventory", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
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
  db.run(
    "INSERT INTO inventory (name, category, sub_category, sub_sub_category, more_category, price, stock, popularity, notes, media_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [name, category, sub_category, sub_sub_category, more_category, price, stock, popularity, notes, media_url],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID });
    }
  );
});

// --- Sales APIs ---
app.get("/sales/all", requireLogin, (req, res) => {
  db.all(
    `SELECT s.id, s.customer_id, s.product_id, s.quantity, s.total, s.date,
      c.name AS customer_name, p.name AS product_name
     FROM sales s
     LEFT JOIN customers c ON s.customer_id = c.id
     LEFT JOIN inventory p ON s.product_id = p.id`,
    (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    }
  );
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
  const tables = ['users', 'customers', 'inventory', 'sales', 'sale_items', 'categories', 'suppliers', 'stock_movements'];
  const data = {};
  let completed = 0;

  tables.forEach(table => {
    db.all(`SELECT * FROM ${table}`, (err, rows) => {
      if (err) {
        data[table] = { error: err.message };
      } else {
        data[table] = rows;
      }
      completed++;
      if (completed === tables.length) {
        res.json(data);
      }
    });
  });
});

// Get sync status
app.get("/api/sync/status", (req, res) => {
  db.all("SELECT COUNT(*) as pending FROM sync_operations WHERE status = 'pending'", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ pendingOperations: row[0].pending });
  });
});

// Mobile app specific endpoints
app.get("/api/mobile/dashboard", requireLogin, (req, res) => {
  // Get dashboard statistics
  const queries = {
    totalCustomers: "SELECT COUNT(*) as count FROM customers",
    totalProducts: "SELECT COUNT(*) as count FROM inventory WHERE is_active = 1",
    totalSales: "SELECT SUM(total) as total FROM sales WHERE status = 'completed'",
    lowStockItems: "SELECT COUNT(*) as count FROM inventory WHERE stock <= min_stock_level AND is_active = 1"
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.get(queries[key], (err, row) => {
      if (err) {
        results[key] = 0;
      } else {
        results[key] = row.count || row.total || 0;
      }
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// Get products for POS
app.get("/api/mobile/products", requireLogin, (req, res) => {
  db.all("SELECT * FROM inventory WHERE is_active = 1 ORDER BY name", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get customers for CRM
app.get("/api/mobile/customers", requireLogin, (req, res) => {
  db.all("SELECT * FROM customers ORDER BY name", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
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

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📱 Mobile app can connect via: http://192.168.0.194:${PORT}`);
  console.log(`🌐 Web interface: http://192.168.0.194:${PORT}`);
  console.log(`📡 Network access: http://192.168.0.194:${PORT}`);
});
