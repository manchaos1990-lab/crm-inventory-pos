// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'manager';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  image?: string;
  barcode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalSpent: number;
  lastPurchase?: Date;
  purchaseCount: number;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  price: number; // Price at time of adding to cart
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customerId?: string;
}

// Order Types
export interface Order {
  id: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  Products: undefined;
  Cart: undefined;
  Customers: undefined;
  Inventory: undefined;
  Settings: undefined;
  Chat: undefined;
  ProductDetail: { productId: string };
  CustomerDetail: { customerId: string };
  AddProduct: undefined;
  AddCustomer: undefined;
  EditProduct: { productId: string };
  EditCustomer: { customerId: string };
};

// Store Types
export interface AppState {
  user: User | null;
  cart: Cart;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
}
