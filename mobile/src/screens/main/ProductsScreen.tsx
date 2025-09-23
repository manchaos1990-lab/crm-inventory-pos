import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Card, Button } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';

export const ProductsScreen: React.FC = () => {
  const { products, addToCart } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card variant="elevated" padding="md" style={{ marginBottom: 12 }}>
      <View className="flex-row">
        {/* Product Image Placeholder */}
        <View className="w-16 h-16 bg-gray-200 rounded-lg items-center justify-center mr-3">
          {product.image ? (
            <Text className="text-xs text-gray-500">Image</Text>
          ) : (
            <Ionicons name="cube" size={24} color="#9ca3af" />
          )}
        </View>

        {/* Product Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={2}>
            {product.name}
          </Text>
          <Text className="text-sm text-gray-500 mb-1">SKU: {product.sku}</Text>
          <Text className="text-sm text-gray-500 mb-2">Category: {product.category}</Text>
          
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-primary-600">
                ${product.price.toFixed(2)}
              </Text>
              <Text className="text-xs text-gray-500">
                Stock: {product.stock}
              </Text>
            </View>
            
            <Button
              title="Add"
              onPress={() => handleAddToCart(product)}
              size="sm"
              icon="add"
            />
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-3">Products</Text>
        
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

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-primary-600'
                    : 'bg-gray-200'
                }`}
              >
                <Text className={`text-sm font-medium ${
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
