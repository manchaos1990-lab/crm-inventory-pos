import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Card, Button } from '../../components';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View className="flex-row items-center py-4 border-b border-gray-100">
        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color="#6b7280" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">{title}</Text>
          {subtitle && (
            <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
          )}
        </View>
        {rightElement || (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Profile Section */}
        <Card variant="elevated" padding="lg" style={{ marginBottom: 16 }}>
          <View className="items-center">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
              <Text className="text-primary-600 font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-1">
              {user?.name}
            </Text>
            <Text className="text-gray-500 mb-2">{user?.email}</Text>
            <View className="bg-primary-100 rounded-full px-3 py-1">
              <Text className="text-primary-700 text-sm font-medium capitalize">
                {user?.role}
              </Text>
            </View>
          </View>
        </Card>

        {/* App Settings */}
        <Card variant="outlined" padding="none" style={{ marginBottom: 16 }}>
          <View className="px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">App Settings</Text>
          </View>
          
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive alerts for low stock and new orders"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f3f4f6'}
              />
            }
          />
          
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            rightElement={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={darkModeEnabled ? '#ffffff' : '#f3f4f6'}
              />
            }
          />
          
          <SettingItem
            icon="language"
            title="Language"
            subtitle="English (US)"
            onPress={() => {}}
          />
        </Card>

        {/* Business Settings */}
        <Card variant="outlined" padding="none" style={{ marginBottom: 16 }}>
          <View className="px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Business Settings</Text>
          </View>
          
          <SettingItem
            icon="storefront"
            title="Store Information"
            subtitle="Manage store details and settings"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="card"
            title="Payment Methods"
            subtitle="Configure payment options"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="receipt"
            title="Tax Settings"
            subtitle="Set up tax rates and rules"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="barcode"
            title="Barcode Scanner"
            subtitle="Configure barcode settings"
            onPress={() => {}}
          />
        </Card>

        {/* Data & Backup */}
        <Card variant="outlined" padding="none" style={{ marginBottom: 16 }}>
          <View className="px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Data & Backup</Text>
          </View>
          
          <SettingItem
            icon="cloud-upload"
            title="Backup Data"
            subtitle="Create a backup of your data"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="cloud-download"
            title="Restore Data"
            subtitle="Restore from a backup"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="download"
            title="Export Data"
            subtitle="Export data to CSV/Excel"
            onPress={() => {}}
          />
        </Card>

        {/* Support */}
        <Card variant="outlined" padding="none" style={{ marginBottom: 16 }}>
          <View className="px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Support</Text>
          </View>
          
          <SettingItem
            icon="help-circle"
            title="Help Center"
            subtitle="Get help and documentation"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="mail"
            title="Contact Support"
            subtitle="Send us a message"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="star"
            title="Rate App"
            subtitle="Rate us on the app store"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="information-circle"
            title="About"
            subtitle="App version and information"
            onPress={() => {}}
          />
        </Card>

        {/* Logout */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          icon="log-out"
          size="lg"
        />

        {/* App Version */}
        <View className="items-center mt-6">
          <Text className="text-sm text-gray-500">
            CRM POS Inventory v1.0.0
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            © 2024 Your Company. All rights reserved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
