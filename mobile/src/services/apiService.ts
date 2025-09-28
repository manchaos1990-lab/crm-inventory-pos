// API Service for communicating with the central server
const API_BASE_URL = 'http://192.168.1.100:3000'; // Update with your server IP

export interface SyncOperationData {
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  recordId?: number;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class ApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string = 'mobile-app-key') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Sync operations to central server
  async syncOperations(operations: SyncOperationData[]): Promise<ApiResponse> {
    try {
      const result = await this.makeRequest('/api/sync', {
        method: 'POST',
        body: JSON.stringify({
          deviceId: 'mobile-device-1', // Generate unique device ID
          operations,
        }),
      });

      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get all data for initial sync
  async getInitialData(): Promise<ApiResponse> {
    try {
      const result = await this.makeRequest('/api/sync/all');
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest('/api/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL);
export default apiService;
