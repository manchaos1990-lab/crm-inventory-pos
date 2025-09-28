// Database helper for CRM-POS-Inventory mobile app
// Uses SQLite for offline storage

const SQLite = require('expo-sqlite');
export const db = SQLite.openDatabaseSync('crm-pos-inventory.db');

// Initialize database tables
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Customers table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          company TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Products table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          cost REAL,
          sku TEXT UNIQUE,
          barcode TEXT,
          category TEXT,
          stock_quantity INTEGER DEFAULT 0,
          min_stock_level INTEGER DEFAULT 0,
          image_url TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Categories table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Sales table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sales (
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
        );`
      );

      // Sale items table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sale_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sale_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price REAL NOT NULL,
          total_price REAL NOT NULL,
          FOREIGN KEY (sale_id) REFERENCES sales (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        );`
      );

      // Suppliers table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS suppliers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          contact_person TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Purchase orders table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS purchase_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          supplier_id INTEGER NOT NULL,
          total_amount REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          received_date DATETIME,
          notes TEXT,
          FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
        );`
      );

      // Purchase order items table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS purchase_order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          purchase_order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          unit_cost REAL NOT NULL,
          total_cost REAL NOT NULL,
          FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        );`
      );

      // Stock movements table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS stock_movements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
          quantity INTEGER NOT NULL,
          reference_id INTEGER, -- sale_id, purchase_order_id, etc.
          reference_type TEXT, -- 'sale', 'purchase', 'adjustment'
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id)
        );`
      );

      // Leads table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          company TEXT,
          source TEXT,
          status TEXT DEFAULT 'new',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Deals table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS deals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lead_id INTEGER,
          customer_id INTEGER,
          title TEXT NOT NULL,
          value REAL,
          stage TEXT DEFAULT 'prospecting',
          probability INTEGER DEFAULT 0,
          expected_close_date DATE,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (lead_id) REFERENCES leads (id),
          FOREIGN KEY (customer_id) REFERENCES customers (id)
        );`
      );

    }, (error) => {
      console.error('Error creating tables:', error);
      reject(error);
    }, () => {
      console.log('Database initialized successfully');
      resolve(true);
    });
  });
};
