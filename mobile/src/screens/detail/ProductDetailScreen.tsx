import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, Button } from '../../components';
import { Ionicons } from '@expo/vector-icons';

export const ProductDetailScreen: React.FC = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Card variant="elevated" padding="lg">
          <Text className="text-xl font-bold text-gray-900 mb-4">Product Detail</Text>
          <Text className="text-gray-600">Product detail screen coming soon...</Text>
        </Card>
      </View>
    </ScrollView>
  );
};
