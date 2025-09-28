import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, Product, Customer, Order, Cart, CartItem } from '../types';

interface AppStore extends AppState {
  // Auth Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Product Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;

  // Customer Actions
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;

  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartCustomer: (customerId: string | undefined) => void;
  applyDiscount: (discount: number) => void;

  // Order Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      cart: initialCart,
      products: [],
      customers: [],
      orders: [],
      isLoading: false,
      error: null,

      // Auth Actions
      setUser: (user) => set({ user }),
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Mock login - replace with actual API call
          const mockUser: User = {
            id: '1',
            email,
            name: 'John Doe',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set({ user: mockUser, isLoading: false });
          return true;
        } catch (error) {
          set({ error: 'Login failed', isLoading: false });
          return false;
        }
      },

      logout: () => set({ user: null, cart: initialCart }),

      // Product Actions
      setProducts: (products) => set({ products }),
      
      addProduct: (product) => set((state) => ({
        products: [...state.products, product]
      })),
      
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
        )
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      
      getProductById: (id) => get().products.find(p => p.id === id),

      // Customer Actions
      setCustomers: (customers) => set({ customers }),
      
      addCustomer: (customer) => set((state) => ({
        customers: [...state.customers, customer]
      })),
      
      updateCustomer: (id, updates) => set((state) => ({
        customers: state.customers.map(c => 
          c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
        )
      })),
      
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),
      
      getCustomerById: (id) => get().customers.find(c => c.id === id),

      // Cart Actions
      addToCart: (product, quantity = 1) => {
        const state = get();
        const existingItem = state.cart.items.find(item => item.product.id === product.id);
        
        let newItems: CartItem[];
        if (existingItem) {
          newItems = state.cart.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...state.cart.items, { product, quantity, price: product.price }];
        }
        
        const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax - state.cart.discount;
        
        set({
          cart: {
            ...state.cart,
            items: newItems,
            subtotal,
            tax,
            total,
          }
        });
      },

      removeFromCart: (productId) => {
        const state = get();
        const newItems = state.cart.items.filter(item => item.product.id !== productId);
        const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax - state.cart.discount;
        
        set({
          cart: {
            ...state.cart,
            items: newItems,
            subtotal,
            tax,
            total,
          }
        });
      },

      updateCartItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        const state = get();
        const newItems = state.cart.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        );
        const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax - state.cart.discount;
        
        set({
          cart: {
            ...state.cart,
            items: newItems,
            subtotal,
            tax,
            total,
          }
        });
      },

      clearCart: () => set({ cart: initialCart }),

      setCartCustomer: (customerId) => set((state) => ({
        cart: { ...state.cart, customerId }
      })),

      applyDiscount: (discount) => {
        const state = get();
        const total = state.cart.subtotal + state.cart.tax - discount;
        set({
          cart: { ...state.cart, discount, total }
        });
      },

      // Order Actions
      setOrders: (orders) => set({ orders }),
      
      addOrder: (order) => set((state) => ({
        orders: [...state.orders, order]
      })),
      
      updateOrder: (id, updates) => set((state) => ({
        orders: state.orders.map(o => 
          o.id === id ? { ...o, ...updates, updatedAt: new Date() } : o
        )
      })),
      
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter(o => o.id !== id)
      })),

      // UI Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        products: state.products,
        customers: state.customers,
        orders: state.orders,
      }),
    }
  )
);
