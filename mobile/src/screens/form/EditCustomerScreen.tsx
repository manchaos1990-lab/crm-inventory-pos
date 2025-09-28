import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, Button } from '../../components';
import { Ionicons } from '@expo/vector-icons';

export const EditCustomerScreen: React.FC = () => {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Card variant="elevated" padding="lg">
          <Text className="text-xl font-bold text-gray-900 mb-4">Edit Customer</Text>
          <Text className="text-gray-600">Edit customer form coming soon...</Text>
        </Card>
      </View>
    </ScrollView>
  );
};
