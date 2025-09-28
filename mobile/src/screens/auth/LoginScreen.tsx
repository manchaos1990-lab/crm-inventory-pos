import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Button, Input, Card } from '../../components';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAppStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo and Title */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-600 rounded-full items-center justify-center mb-4">
              <Ionicons name="storefront" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              CRM POS Inventory
            </Text>
            <Text className="text-gray-600 text-center">
              Sign in to your account to continue
            </Text>
          </View>

          {/* Login Form */}
          <Card variant="elevated" padding="lg">
            <View className="space-y-4">
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed"
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              {error && (
                <View className="bg-error-50 border border-error-200 rounded-lg p-3">
                  <Text className="text-error-600 text-sm">{error}</Text>
                </View>
              )}

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                size="lg"
                style={{ marginTop: 8 }}
              />

              <View className="items-center mt-4">
                <Text className="text-gray-600">
                  Don't have an account?{' '}
                  <Text className="text-primary-600 font-semibold">
                    Contact Admin
                  </Text>
                </Text>
              </View>
            </View>
          </Card>

          {/* Demo Credentials */}
          <Card variant="outlined" padding="md" style={{ marginTop: 16 }}>
            <Text className="text-sm text-gray-600 text-center mb-2">
              Demo Credentials:
            </Text>
            <Text className="text-xs text-gray-500 text-center">
              Email: admin@demo.com{'\n'}
              Password: password123
            </Text>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
