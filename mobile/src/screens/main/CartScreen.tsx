import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Card, Button, Input, Modal } from '../../components';
import { Ionicons } from '@expo/vector-icons';

export const CartScreen: React.FC = () => {
  const { cart, customers, updateCartItemQuantity, removeFromCart, clearCart, setCartCustomer, applyDiscount } = useAppStore();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(cart.customerId);

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartItemQuantity(productId, quantity);
    }
  };

  const handleApplyDiscount = () => {
    const discount = parseFloat(discountAmount);
    if (discount > 0 && discount <= cart.subtotal) {
      applyDiscount(discount);
      setDiscountAmount('');
    } else {
      Alert.alert('Invalid Discount', 'Please enter a valid discount amount');
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add some items to the cart');
      return;
    }

    Alert.alert(
      'Checkout',
      `Total: $${cart.total.toFixed(2)}\n\nProceed with payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay', 
          onPress: () => {
            // Handle checkout logic here
            clearCart();
            Alert.alert('Success', 'Order completed successfully!');
          }
        }
      ]
    );
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'Walk-in Customer';
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">Shopping Cart</Text>
        <Text className="text-sm text-gray-500">
          {cart.items.length} item(s) in cart
        </Text>
      </View>

      {cart.items.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="cart-outline" size={64} color="#9ca3af" />
          <Text className="text-lg font-medium text-gray-500 mt-4 mb-2">
            Your cart is empty
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Add some products to get started
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-4">
            {/* Customer Selection */}
            <Card variant="outlined" padding="md" style={{ marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setShowCustomerModal(true)}
                className="flex-row items-center justify-between"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </Text>
                  <Text className="text-base text-gray-900">
                    {getCustomerName(selectedCustomer)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </Card>

            {/* Cart Items */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Items ({cart.items.length})
              </Text>
              
              {cart.items.map((item) => (
                <Card key={item.product.id} variant="outlined" padding="md" style={{ marginBottom: 12 }}>
                  <View className="flex-row">
                    {/* Product Image */}
                    <View className="w-16 h-16 bg-gray-200 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="cube" size={24} color="#9ca3af" />
                    </View>

                    {/* Product Info */}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={2}>
                        {item.product.name}
                      </Text>
                      <Text className="text-sm text-gray-500 mb-2">
                        ${item.price.toFixed(2)} each
                      </Text>
                      
                      <View className="flex-row items-center justify-between">
                        {/* Quantity Controls */}
                        <View className="flex-row items-center">
                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                          >
                            <Ionicons name="remove" size={16} color="#6b7280" />
                          </TouchableOpacity>
                          
                          <Text className="mx-4 text-base font-medium text-gray-900">
                            {item.quantity}
                          </Text>
                          
                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                          >
                            <Ionicons name="add" size={16} color="#6b7280" />
                          </TouchableOpacity>
                        </View>

                        {/* Item Total */}
                        <View className="items-end">
                          <Text className="text-base font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeFromCart(item.product.id)}
                            className="mt-1"
                          >
                            <Text className="text-sm text-error-500">Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>

            {/* Discount */}
            <Card variant="outlined" padding="md" style={{ marginBottom: 16 }}>
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Discount
              </Text>
              <View className="flex-row items-center space-x-2">
                <Input
                  placeholder="Enter discount amount"
                  value={discountAmount}
                  onChangeText={setDiscountAmount}
                  keyboardType="numeric"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Apply"
                  onPress={handleApplyDiscount}
                  size="sm"
                  variant="outline"
                />
              </View>
              {cart.discount > 0 && (
                <Text className="text-sm text-success-600 mt-2">
                  Discount applied: -${cart.discount.toFixed(2)}
                </Text>
              )}
            </Card>

            {/* Order Summary */}
            <Card variant="elevated" padding="md">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </Text>
              
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Subtotal</Text>
                  <Text className="text-gray-900">${cart.subtotal.toFixed(2)}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Tax (8%)</Text>
                  <Text className="text-gray-900">${cart.tax.toFixed(2)}</Text>
                </View>
                
                {cart.discount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Discount</Text>
                    <Text className="text-success-600">-${cart.discount.toFixed(2)}</Text>
                  </View>
                )}
                
                <View className="border-t border-gray-200 pt-2 mt-2">
                  <View className="flex-row justify-between">
                    <Text className="text-lg font-semibold text-gray-900">Total</Text>
                    <Text className="text-lg font-bold text-primary-600">
                      ${cart.total.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      )}

      {/* Checkout Button */}
      {cart.items.length > 0 && (
        <View className="bg-white border-t border-gray-200 p-4">
          <View className="flex-row space-x-3">
            <Button
              title="Clear Cart"
              onPress={() => {
                Alert.alert(
                  'Clear Cart',
                  'Are you sure you want to clear all items?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', onPress: clearCart, style: 'destructive' }
                  ]
                );
              }}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title={`Checkout - $${cart.total.toFixed(2)}`}
              onPress={handleCheckout}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      )}

      {/* Customer Selection Modal */}
      <Modal
        visible={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Select Customer"
        size="md"
      >
        <ScrollView className="max-h-96">
          <TouchableOpacity
            onPress={() => {
              setSelectedCustomer(undefined);
              setCartCustomer(undefined);
              setShowCustomerModal(false);
            }}
            className="p-3 border-b border-gray-200"
          >
            <Text className="text-base text-gray-900">Walk-in Customer</Text>
          </TouchableOpacity>
          
          {customers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              onPress={() => {
                setSelectedCustomer(customer.id);
                setCartCustomer(customer.id);
                setShowCustomerModal(false);
              }}
              className="p-3 border-b border-gray-200"
            >
              <Text className="text-base text-gray-900">{customer.name}</Text>
              <Text className="text-sm text-gray-500">{customer.email}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
};
