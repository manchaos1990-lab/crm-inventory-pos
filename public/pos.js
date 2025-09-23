// Modern POS System JavaScript
class ModernPOS {
  constructor() {
    this.products = [];
    this.customers = [];
    this.categories = [];
    this.cart = [];
    this.selectedCategory = 'all';
    this.searchTerm = '';

    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.renderProducts();
    this.renderCategories();
    this.renderCustomers();
    this.updateCartDisplay();
  }

  async loadData() {
    try {
      // Load products
      const productsRes = await fetch("/inventory/all");
      this.products = await productsRes.json();

      // Load customers
      const customersRes = await fetch("/customers/all");
      this.customers = await customersRes.json();

      // Extract unique categories
      this.categories = [...new Set(this.products.map(p => p.category).filter(c => c))];

    } catch (error) {
      console.error('Error loading data:', error);
      this.showMessage('Error loading data', 'error');
    }
  }

  setupEventListeners() {
    // Product search
    document.getElementById('productSearch').addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.renderProducts();
    });

    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', () => {
      this.processSale();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.cart.length > 0) {
        this.processSale();
      }
    });
  }

  renderCategories() {
    const categoryFilter = document.getElementById('categoryFilter');

    // Add "All" category
    const allBtn = this.createCategoryButton('all', 'All Categories', this.selectedCategory === 'all');
    categoryFilter.appendChild(allBtn);

    // Add category buttons
    this.categories.forEach(category => {
      const btn = this.createCategoryButton(category, category, this.selectedCategory === category);
      categoryFilter.appendChild(btn);
    });
  }

  createCategoryButton(value, label, isActive) {
    const btn = document.createElement('button');
    btn.className = `category-btn ${isActive ? 'active' : ''}`;
    btn.textContent = label;
    btn.onclick = () => {
      this.selectedCategory = value;
      this.renderCategories();
      this.renderProducts();
    };
    return btn;
  }

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    const filteredProducts = this.products.filter(product => {
      const matchesCategory = this.selectedCategory === 'all' || product.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm));

      return matchesCategory && matchesSearch && product.is_active !== 0;
    });

    if (filteredProducts.length === 0) {
      grid.innerHTML = '<div class="loading">No products found</div>';
      return;
    }

    filteredProducts.forEach(product => {
      const card = this.createProductCard(product);
      grid.appendChild(card);
    });
  }

  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => this.addToCart(product);

    const stockStatus = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
    const stockColor = product.stock > 0 ? '#28a745' : '#dc3545';

    card.innerHTML = `
      <div class="product-name">${product.name}</div>
      <div class="product-price">₹${product.price}</div>
      <div class="product-stock" style="color: ${stockColor}">${stockStatus}</div>
    `;

    return card;
  }

  renderCustomers() {
    const select = document.getElementById('customerSelect');
    select.innerHTML = '<option value="">Walk-in Customer</option>';

    this.customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.id;
      option.textContent = `${customer.name} - ${customer.phone || 'No phone'}`;
      select.appendChild(option);
    });
  }

  addToCart(product) {
    if (product.stock <= 0) {
      this.showMessage('Product out of stock', 'error');
      return;
    }

    const existingItem = this.cart.find(item => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        this.showMessage('Not enough stock available', 'error');
        return;
      }
      existingItem.quantity++;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      });
    }

    this.updateCartDisplay();
    this.showMessage(`${product.name} added to cart`, 'success');
  }

  updateCartItemQuantity(productId, newQuantity) {
    const item = this.cart.find(item => item.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (newQuantity > item.stock) {
      this.showMessage('Not enough stock available', 'error');
      return;
    }

    item.quantity = newQuantity;
    this.updateCartDisplay();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (this.cart.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart">
          <i>🛒</i>
          <p>Cart is empty</p>
          <p>Select products to add to cart</p>
        </div>
      `;
      cartTotal.textContent = '₹0.00';
      checkoutBtn.disabled = true;
      return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    this.cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price} each</div>
        </div>
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="pos.decreaseQuantity(${item.id})">-</button>
          <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
          <button class="quantity-btn" onclick="pos.increaseQuantity(${item.id})">+</button>
          <span class="remove-btn" onclick="pos.removeFromCart(${item.id})" title="Remove">×</span>
        </div>
        <div style="font-weight: bold; color: #28a745;">₹${itemTotal.toFixed(2)}</div>
      `;
      cartItems.appendChild(itemElement);
    });

    cartTotal.textContent = `₹${total.toFixed(2)}`;
    checkoutBtn.disabled = false;
  }

  increaseQuantity(productId) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      this.updateCartItemQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      this.updateCartItemQuantity(productId, item.quantity - 1);
    }
  }

  async processSale() {
    if (this.cart.length === 0) {
      this.showMessage('Cart is empty', 'error');
      return;
    }

    const customerId = document.getElementById('customerSelect').value;
    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
      // Prepare sale data
      const saleData = {
        customerId: customerId || null,
        items: this.cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        total: total,
        paymentMethod: 'cash' // Default payment method
      };

      // Submit sale
      const response = await fetch('/sales/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        const result = await response.json();
        this.showReceipt(result);
        this.clearCart();
        this.showMessage('Sale completed successfully!', 'success');
      } else {
        throw new Error('Failed to process sale');
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      this.showMessage('Error processing sale', 'error');
    }
  }

  showReceipt(saleResult) {
    const modal = document.getElementById('receiptModal');
    const receiptContent = document.getElementById('receiptContent');

    const customerName = this.customers.find(c => c.id == document.getElementById('customerSelect').value)?.name || 'Walk-in Customer';
    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let receiptHTML = `
      <div style="font-family: monospace; text-align: center;">
        <h4>RECEIPT</h4>
        <p>Customer: ${customerName}</p>
        <p>Date: ${new Date().toLocaleString()}</p>
        <hr>
    `;

    this.cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      receiptHTML += `
        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
          <span>${item.name} x${item.quantity}</span>
          <span>₹${itemTotal.toFixed(2)}</span>
        </div>
      `;
    });

    receiptHTML += `
        <hr>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
          <span>TOTAL:</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
        <p style="margin-top: 20px; font-size: 12px;">Thank you for your business!</p>
      </div>
    `;

    receiptContent.innerHTML = receiptHTML;
    modal.style.display = 'block';
  }

  clearCart() {
    this.cart = [];
    this.updateCartDisplay();
  }

  showMessage(message, type = 'info') {
    // Simple message display - you can enhance this with a proper notification system
    console.log(`${type.toUpperCase()}: ${message}`);

    // For now, just use alert for important messages
    if (type === 'error') {
      alert(`Error: ${message}`);
    }
  }
}

// Global functions for HTML onclick handlers
function printReceipt() {
  window.print();
}

function closeReceipt() {
  document.getElementById('receiptModal').style.display = 'none';
}

// Initialize POS when page loads
let pos;
document.addEventListener('DOMContentLoaded', () => {
  pos = new ModernPOS();
});

// Make functions globally available
window.pos = pos;
window.printReceipt = printReceipt;
window.closeReceipt = closeReceipt;
