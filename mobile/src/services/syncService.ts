import * as SQLite from 'expo-sqlite';
import { db } from '../db/index';
import { apiService } from './apiService';

// Types for sync operations
export interface SyncOperation {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
  userId: string;
  deviceId: string;
  syncStatus: 'pending' | 'synced' | 'conflict' | 'failed';
}

export interface SyncConfig {
  centralServerUrl: string;
  apiKey: string;
  syncInterval: number; // in milliseconds
  maxRetries: number;
  conflictResolution: 'last-write-wins' | 'admin-approval' | 'merge';
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
}

class SyncService {
  private config: SyncConfig;
  private pendingOperations: SyncOperation[] = [];
  private syncInProgress = false;
  private networkStatus: NetworkStatus = {
    isConnected: false,
    isInternetReachable: false,
    type: null,
  };

  constructor(config: SyncConfig) {
    this.config = config;
    this.initializeSync();
  }

  private async initializeSync() {
    // Load pending operations from local storage
    await this.loadPendingOperations();

    // Set up network monitoring
    this.setupNetworkMonitoring();

    // Start periodic sync
    this.startPeriodicSync();
  }

  private setupNetworkMonitoring() {
    // Simple network monitoring - check every 10 seconds
    setInterval(async () => {
      try {
        // Simple connectivity check by trying to reach the server
        const isConnected = await this.checkServerConnectivity();
        this.networkStatus = {
          isConnected,
          isInternetReachable: isConnected,
          type: isConnected ? 'wifi' : null,
        };

        if (this.networkStatus.isConnected && this.pendingOperations.length > 0) {
          this.syncPendingOperations();
        }
      } catch (error) {
        this.networkStatus = {
          isConnected: false,
          isInternetReachable: false,
          type: null,
        };
      }
    }, 10000); // Check every 10 seconds
  }

  private async checkServerConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.config.centralServerUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private startPeriodicSync() {
    setInterval(async () => {
      if (this.networkStatus.isConnected && !this.syncInProgress) {
        await this.syncPendingOperations();
      }
    }, this.config.syncInterval);
  }

  // Record a database operation for later sync
  public async recordOperation(
    table: string,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    data: any,
    userId: string,
    deviceId: string
  ): Promise<void> {
    const operation: SyncOperation = {
      id: this.generateOperationId(),
      table,
      action,
      data,
      timestamp: Date.now(),
      userId,
      deviceId,
      syncStatus: 'pending',
    };

    this.pendingOperations.push(operation);
    await this.savePendingOperations();

    // Try immediate sync if online
    if (this.networkStatus.isConnected) {
      await this.syncOperation(operation);
    }
  }

  // Sync a single operation to central server
  private async syncOperation(operation: SyncOperation): Promise<boolean> {
    try {
      const response = await apiService.syncOperations([{
        table: operation.table,
        action: operation.action,
        data: operation.data,
        recordId: operation.data.id,
      }]);

      if (response.success) {
        operation.syncStatus = 'synced';
        await this.removePendingOperation(operation.id);
        return true;
      } else {
        // Check if it's a conflict (409) or other error
        if (response.error?.includes('409') || response.error?.includes('conflict')) {
          operation.syncStatus = 'conflict';
          await this.handleConflict(operation);
        } else {
          operation.syncStatus = 'failed';
        }
        return false;
      }
    } catch (error) {
      console.error('Sync operation failed:', error);
      operation.syncStatus = 'failed';
      return false;
    }
  }

  // Sync all pending operations
  private async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress || this.pendingOperations.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Syncing ${this.pendingOperations.length} pending operations...`);

    const operationsToSync = [...this.pendingOperations];

    for (const operation of operationsToSync) {
      if (operation.syncStatus === 'pending') {
        await this.syncOperation(operation);
      }
    }

    this.syncInProgress = false;
    await this.savePendingOperations();
  }

  // Handle sync conflicts
  private async handleConflict(operation: SyncOperation): Promise<void> {
    console.log(`Conflict detected for operation ${operation.id}`);

    switch (this.config.conflictResolution) {
      case 'last-write-wins':
        await this.resolveConflictLastWriteWins(operation);
        break;
      case 'admin-approval':
        await this.queueForAdminApproval(operation);
        break;
      case 'merge':
        await this.resolveConflictMerge(operation);
        break;
    }
  }

  private async resolveConflictLastWriteWins(operation: SyncOperation): Promise<void> {
    // Get the latest version from central server
    try {
      const response = await fetch(
        `${this.config.centralServerUrl}/api/conflict/${operation.table}/${operation.data.id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (response.ok) {
        const centralData = await response.json();

        // Compare timestamps
        if (operation.timestamp > centralData.updated_at) {
          // Local data is newer, force update
          await this.forceUpdateOperation(operation);
        } else {
          // Central data is newer, update local
          await this.updateLocalData(operation.table, centralData);
          operation.syncStatus = 'synced';
          await this.removePendingOperation(operation.id);
        }
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  }

  private async queueForAdminApproval(operation: SyncOperation): Promise<void> {
    // Store conflict for admin review
    await this.saveConflictForReview(operation);
  }

  private async resolveConflictMerge(operation: SyncOperation): Promise<void> {
    // Implement merge logic based on data type
    // This would be customized for each table
    console.log('Merge conflict resolution not implemented yet');
  }

  // Force update operation (for last-write-wins)
  private async forceUpdateOperation(operation: SyncOperation): Promise<void> {
    try {
      const response = await fetch(`${this.config.centralServerUrl}/api/sync/force`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(operation),
      });

      if (response.ok) {
        operation.syncStatus = 'synced';
        await this.removePendingOperation(operation.id);
      }
    } catch (error) {
      console.error('Force update failed:', error);
    }
  }

  // Update local data with central server data
  private async updateLocalData(table: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        const updateQuery = this.buildUpdateQuery(table, data);
        tx.executeSql(
          updateQuery.sql,
          updateQuery.params,
          () => resolve(),
          (_: any, error: any) => reject(error)
        );
      });
    });
  }

  // Build update query based on table and data
  private buildUpdateQuery(table: string, data: any): { sql: string; params: any[] } {
    const fields = Object.keys(data).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const params = fields.map(field => data[field]);
    params.push(data.id);

    return {
      sql: `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      params,
    };
  }

  // Utility methods
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadPendingOperations(): Promise<void> {
    // Load from AsyncStorage in real implementation
    this.pendingOperations = [];
  }

  private async savePendingOperations(): Promise<void> {
    // Save to AsyncStorage in real implementation
    console.log(`Saving ${this.pendingOperations.length} pending operations`);
  }

  private async removePendingOperation(operationId: string): Promise<void> {
    this.pendingOperations = this.pendingOperations.filter(op => op.id !== operationId);
    await this.savePendingOperations();
  }

  private async saveConflictForReview(operation: SyncOperation): Promise<void> {
    // Store conflict in local database for admin review
    console.log('Saving conflict for admin review:', operation.id);
  }

  // Public API methods
  public getPendingOperationsCount(): number {
    return this.pendingOperations.length;
  }

  public getSyncStatus(): { inProgress: boolean; pendingCount: number; networkStatus: NetworkStatus } {
    return {
      inProgress: this.syncInProgress,
      pendingCount: this.pendingOperations.length,
      networkStatus: this.networkStatus,
    };
  }

  public async forceSync(): Promise<void> {
    if (this.networkStatus.isConnected) {
      await this.syncPendingOperations();
    }
  }

  public async clearPendingOperations(): Promise<void> {
    this.pendingOperations = [];
    await this.savePendingOperations();
  }
}

// Export singleton instance
export const syncService = new SyncService({
  centralServerUrl: 'http://192.168.1.100:3000', // Local network server
  apiKey: 'mobile-app-key', // Simple API key for mobile app
  syncInterval: 30000, // 30 seconds
  maxRetries: 3,
  conflictResolution: 'last-write-wins',
});

export default syncService;
