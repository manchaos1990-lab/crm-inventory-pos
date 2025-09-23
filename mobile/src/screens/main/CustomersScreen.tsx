import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Card, Button } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { Customer } from '../../types';

export const CustomersScreen: React.FC = () => {
  const { customers } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <Card variant="elevated" padding="md" style={{ marginBottom: 12 }}>
      <View className="flex-row">
        {/* Customer Avatar */}
        <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
          <Text className="text-primary-600 font-semibold text-lg">
            {customer.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Customer Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {customer.name}
          </Text>
          
          {customer.email && (
            <Text className="text-sm text-gray-500 mb-1" numberOfLines={1}>
              {customer.email}
            </Text>
          )}
          
          {customer.phone && (
            <Text className="text-sm text-gray-500 mb-2" numberOfLines={1}>
              {customer.phone}
            </Text>
          )}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-4">
              <View>
                <Text className="text-xs text-gray-500">Total Spent</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  ${customer.totalSpent.toFixed(2)}
                </Text>
              </View>
              
              <View>
                <Text className="text-xs text-gray-500">Orders</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {customer.purchaseCount}
                </Text>
              </View>
            </View>

            <View className="items-end">
              <Button
                title="View"
                onPress={() => {}}
                size="sm"
                variant="outline"
                icon="chevron-forward"
                iconPosition="right"
              />
            </View>
          </View>

          {/* Tags */}
          {customer.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-2">
              {customer.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  className="bg-gray-100 rounded-full px-2 py-1 mr-2 mb-1"
                >
                  <Text className="text-xs text-gray-600">{tag}</Text>
                </View>
              ))}
              {customer.tags.length > 3 && (
                <View className="bg-gray-100 rounded-full px-2 py-1">
                  <Text className="text-xs text-gray-600">
                    +{customer.tags.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-3">Customers</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Stats */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary-600">
              {customers.length}
            </Text>
            <Text className="text-sm text-gray-500">Total Customers</Text>
          </View>
          
          <View className="items-center">
            <Text className="text-2xl font-bold text-success-600">
              ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(0)}
            </Text>
            <Text className="text-sm text-gray-500">Total Revenue</Text>
          </View>
          
          <View className="items-center">
            <Text className="text-2xl font-bold text-warning-600">
              {customers.filter(c => c.purchaseCount > 0).length}
            </Text>
            <Text className="text-sm text-gray-500">Active Customers</Text>
          </View>
        </View>
      </View>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="people-outline" size={64} color="#9ca3af" />
          <Text className="text-lg font-medium text-gray-500 mt-4 mb-2">
            {searchQuery ? 'No customers found' : 'No customers yet'}
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            {searchQuery ? 'Try adjusting your search terms' : 'Add some customers to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CustomerCard customer={item} />}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
        onPress={() => {}}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};
