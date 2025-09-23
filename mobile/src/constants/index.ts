// App Configuration
export const APP_CONFIG = {
  name: 'CRM POS Inventory',
  version: '1.0.0',
  apiUrl: 'https://api.yourapp.com', // Replace with your API URL
};

// Colors
export const COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

// Screen Names
export const SCREEN_NAMES = {
  AUTH: 'Auth',
  MAIN: 'Main',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  DASHBOARD: 'Dashboard',
  PRODUCTS: 'Products',
  CART: 'Cart',
  CUSTOMERS: 'Customers',
  INVENTORY: 'Inventory',
  SETTINGS: 'Settings',
  CHAT: 'Chat',
  PRODUCT_DETAIL: 'ProductDetail',
  CUSTOMER_DETAIL: 'CustomerDetail',
  ADD_PRODUCT: 'AddProduct',
  ADD_CUSTOMER: 'AddCustomer',
  EDIT_PRODUCT: 'EditProduct',
  EDIT_CUSTOMER: 'EditCustomer',
} as const;

// Tab Names
export const TAB_NAMES = {
  DASHBOARD: 'Dashboard',
  PRODUCTS: 'Products',
  CART: 'Cart',
  CUSTOMERS: 'Customers',
  INVENTORY: 'Inventory',
  CHAT: 'Chat',
} as const;

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverage',
  'Books',
  'Home & Garden',
  'Sports',
  'Beauty',
  'Toys',
  'Automotive',
  'Other',
] as const;

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'digital', label: 'Digital Wallet' },
] as const;

// Order Status
export const ORDER_STATUS = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
  { value: 'refunded', label: 'Refunded', color: '#64748b' },
] as const;

// User Roles
export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
] as const;

// Database Tables
export const DB_TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
  },
  CUSTOMERS: {
    LIST: '/customers',
    CREATE: '/customers',
    UPDATE: '/customers/:id',
    DELETE: '/customers/:id',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders/:id',
    DELETE: '/orders/:id',
  },
} as const;
