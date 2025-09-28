import { useAppStore } from '../store/useAppStore';
import { sampleProducts, sampleCustomers, sampleOrders } from './mockData';
import { initDatabase } from '../db/index';
import { syncService } from './syncService';

export const initializeAppWithSampleData = async () => {
  try {
    // Initialize SQLite database
    await initDatabase();
    console.log('Database initialized');

    // Initialize sync service
    console.log('Sync service initialized');

    // For now, still use sample data until sync is working
    const { setProducts, setCustomers, setOrders } = useAppStore.getState();
    setProducts(sampleProducts);
    setCustomers(sampleCustomers);
    setOrders(sampleOrders);

    console.log('App initialized with sample data');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

export const clearAllData = () => {
  const { setProducts, setCustomers, setOrders, clearCart } = useAppStore.getState();
  
  setProducts([]);
  setCustomers([]);
  setOrders([]);
  clearCart();
  
  console.log('All data cleared');
};
