import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Card, Button } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';

export const InventoryScreen: React.FC = () => {
  const { products } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return a.stock - b.stock;
        case 'price':
          return a.price - b.price;
        default:
          return 0;
      }
    });

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Low stock products
  const lowStockProducts = products.filter(product => product.stock <= product.minStock);

  const ProductCard = ({ product }: { product: Product }) => {
    const isLowStock = product.stock <= product.minStock;
    const isOutOfStock = product.stock === 0;

    return (
      <Card 
        variant="outlined" 
        padding="md" 
        style={{ 
          marginBottom: 12,
          borderLeftColor: isLowStock ? '#f59e0b' : '#e5e7eb',
          borderLeftWidth: isLowStock ? 4 : 1,
        }}
      >
        <View className="flex-row">
          {/* Product Image */}
          <View className="w-16 h-16 bg-gray-200 rounded-lg items-center justify-center mr-3">
            {product.image ? (
              <Text className="text-xs text-gray-500">Image</Text>
            ) : (
              <Ionicons name="cube" size={24} color="#9ca3af" />
            )}
          </View>

          {/* Product Info */}
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-1">
              <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={2}>
                {product.name}
              </Text>
              {isOutOfStock && (
                <View className="bg-error-100 rounded-full px-2 py-1 ml-2">
                  <Text className="text-xs text-error-600 font-medium">Out of Stock</Text>
                </View>
              )}
              {isLowStock && !isOutOfStock && (
                <View className="bg-warning-100 rounded-full px-2 py-1 ml-2">
                  <Text className="text-xs text-warning-600 font-medium">Low Stock</Text>
                </View>
              )}
            </View>
            
            <Text className="text-sm text-gray-500 mb-1">SKU: {product.sku}</Text>
            <Text className="text-sm text-gray-500 mb-2">Category: {product.category}</Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-primary-600">
                  ${product.price.toFixed(2)}
                </Text>
                <Text className="text-sm text-gray-500">
                  Cost: ${product.cost.toFixed(2)}
                </Text>
              </View>
              
              <View className="items-end">
                <Text className={`text-lg font-semibold ${
                  isOutOfStock ? 'text-error-600' : 
                  isLowStock ? 'text-warning-600' : 
                  'text-gray-900'
                }`}>
                  {product.stock}
                </Text>
                <Text className="text-xs text-gray-500">
                  Min: {product.minStock}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-2 mt-3">
              <Button
                title="Edit"
                onPress={() => {}}
                size="sm"
                variant="outline"
                icon="create"
                style={{ flex: 1 }}
              />
              <Button
                title="Restock"
                onPress={() => {}}
                size="sm"
                variant="outline"
                icon="add-circle"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-3">Inventory</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Filters */}
        <View className="flex-row space-x-2 mb-3">
          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View className="flex-row space-x-2">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full ${
                    selectedCategory === category
                      ? 'bg-primary-600'
                      : 'bg-gray-200'
                  }`}
                >
                  <Text className={`text-xs font-medium ${
                    selectedCategory === category
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Sort Options */}
        <View className="flex-row space-x-2">
          {(['name', 'stock', 'price'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setSortBy(option)}
              className={`px-3 py-1 rounded-full ${
                sortBy === option
                  ? 'bg-secondary-600'
                  : 'bg-gray-200'
              }`}
            >
              <Text className={`text-xs font-medium ${
                sortBy === option
                  ? 'text-white'
                  : 'text-gray-700'
              }`}>
                Sort by {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <View className="bg-warning-50 border-b border-warning-200 px-4 py-3">
          <View className="flex-row items-center">
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text className="text-sm text-warning-700 ml-2 flex-1">
              {lowStockProducts.length} product(s) are running low on stock
            </Text>
          </View>
        </View>
      )}

      {/* Stats */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary-600">
              {products.length}
            </Text>
            <Text className="text-sm text-gray-500">Total Products</Text>
          </View>
          
          <View className="items-center">
            <Text className="text-2xl font-bold text-warning-600">
              {lowStockProducts.length}
            </Text>
            <Text className="text-sm text-gray-500">Low Stock</Text>
          </View>
          
          <View className="items-center">
            <Text className="text-2xl font-bold text-error-600">
              {products.filter(p => p.stock === 0).length}
            </Text>
            <Text className="text-sm text-gray-500">Out of Stock</Text>
          </View>
        </View>
      </View>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="cube-outline" size={64} color="#9ca3af" />
          <Text className="text-lg font-medium text-gray-500 mt-4 mb-2">
            No products found
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            {searchQuery ? 'Try adjusting your search terms' : 'Add some products to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
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
