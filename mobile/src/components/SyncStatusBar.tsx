import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { syncService } from '../services/syncService';

interface SyncStatus {
  inProgress: boolean;
  pendingCount: number;
  networkStatus: {
    isConnected: boolean;
    isInternetReachable: boolean;
    type: string | null;
  };
}

export const SyncStatusBar: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    inProgress: false,
    pendingCount: 0,
    networkStatus: {
      isConnected: false,
      isInternetReachable: false,
      type: null,
    },
  });

  useEffect(() => {
    const updateStatus = () => {
      const status = syncService.getSyncStatus();
      setSyncStatus(status);
    };

    // Update status immediately
    updateStatus();

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleForceSync = () => {
    syncService.forceSync();
  };

  const getStatusColor = () => {
    if (!syncStatus.networkStatus.isConnected) return '#ef4444'; // red
    if (syncStatus.inProgress) return '#f59e0b'; // yellow
    if (syncStatus.pendingCount > 0) return '#f59e0b'; // yellow
    return '#22c55e'; // green
  };

  const getStatusText = () => {
    if (!syncStatus.networkStatus.isConnected) return 'Offline';
    if (syncStatus.inProgress) return 'Syncing...';
    if (syncStatus.pendingCount > 0) return `${syncStatus.pendingCount} pending`;
    return 'Synced';
  };

  const getStatusIcon = () => {
    if (!syncStatus.networkStatus.isConnected) return 'cloud-offline';
    if (syncStatus.inProgress) return 'sync';
    if (syncStatus.pendingCount > 0) return 'cloud-upload';
    return 'cloud-done';
  };

  return (
    <TouchableOpacity
      onPress={handleForceSync}
      className="bg-white border-b border-gray-200 px-4 py-2"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons
            name={getStatusIcon() as any}
            size={16}
            color={getStatusColor()}
            style={{ marginRight: 8 }}
          />
          <Text className="text-sm text-gray-600">
            {getStatusText()}
          </Text>
        </View>
        {syncStatus.pendingCount > 0 && (
          <TouchableOpacity onPress={handleForceSync}>
            <Text className="text-sm text-blue-600 font-medium">Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
