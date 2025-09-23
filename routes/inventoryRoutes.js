const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Add new product
router.post("/add", (req, res) => {
  const { name, category, price, stock } = req.body;
  db.run(
    "INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)",
    [name, category, price, stock],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "✅ Product added", productId: this.lastID });
    }
  );
});

// Get all products
router.get("/all", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
