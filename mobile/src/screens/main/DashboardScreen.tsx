import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Card, Button, SyncStatusBar } from '../../components';
import { Ionicons } from '@expo/vector-icons';

export const DashboardScreen: React.FC = () => {
  const { user, products, customers, orders, cart } = useAppStore();

  // Calculate dashboard metrics
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const cartItems = cart.items.length;
  const cartTotal = cart.total;

  // Calculate today's sales (mock data)
  const todaySales = orders
    .filter(order => {
      const today = new Date();
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((sum, order) => sum + order.total, 0);

  // Low stock products
  const lowStockProducts = products.filter(product => product.stock <= product.minStock);

  const StatCard = ({ title, value, icon, color, onPress }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity onPress={onPress}>
      <Card variant="elevated" padding="md" style={{ marginBottom: 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">{title}</Text>
            <Text className="text-2xl font-bold text-gray-900">{value}</Text>
          </View>
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: color + '20' }}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <SyncStatusBar />
      <ScrollView className="flex-1">
        <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {user?.name}!
          </Text>
          <Text className="text-gray-600">
            Here's what's happening with your business today
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Overview</Text>
          
          <StatCard
            title="Today's Sales"
            value={`$${todaySales.toFixed(2)}`}
            icon="trending-up"
            color="#22c55e"
          />
          
          <StatCard
            title="Total Products"
            value={totalProducts}
            icon="cube"
            color="#3b82f6"
          />
          
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            icon="people"
            color="#8b5cf6"
          />
          
          <StatCard
            title="Cart Items"
            value={cartItems}
            icon="cart"
            color="#f59e0b"
          />
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <Button
                title="Add Product"
                onPress={() => {}}
                icon="add"
                variant="outline"
                size="sm"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <Button
                title="Add Customer"
                onPress={() => {}}
                icon="person-add"
                variant="outline"
                size="sm"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <Button
                title="View Cart"
                onPress={() => {}}
                icon="cart"
                variant="outline"
                size="sm"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <Button
                title="AI Assistant"
                onPress={() => {}}
                icon="chatbubble"
                variant="outline"
                size="sm"
              />
            </View>
          </View>
        </View>

        {/* Alerts */}
        {lowStockProducts.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Alerts</Text>
            
            <Card variant="outlined" padding="md" style={{ borderLeftColor: '#f59e0b', borderLeftWidth: 4 }}>
              <View className="flex-row items-center">
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  {lowStockProducts.length} product(s) are running low on stock
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Recent Orders */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</Text>
          
          {orders.length === 0 ? (
            <Card variant="outlined" padding="md">
              <Text className="text-gray-500 text-center">No recent orders</Text>
            </Card>
          ) : (
            <Card variant="outlined" padding="md">
              {orders.slice(0, 3).map((order) => (
                <View key={order.id} className="flex-row items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">
                      Order #{order.id.slice(-6)}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-gray-900">
                    ${order.total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </View>

        {/* AI Insights Card */}
        <Card variant="elevated" padding="md" style={{ backgroundColor: '#f0f9ff' }}>
          <View className="flex-row items-start">
            <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="bulb" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                AI Insight
              </Text>
              <Text className="text-sm text-gray-600">
                Your top-selling category is Electronics. Consider restocking popular items to maximize sales.
              </Text>
            </View>
          </View>
        </Card>
        </View>
      </ScrollView>
    </View>
  );
};
