import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Card, Button } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../types';

export const ChatScreen: React.FC = () => {
  const { products, customers, orders, cart } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. I can help you with sales analytics, inventory management, and customer insights. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Sales analytics
    if (input.includes('sales') || input.includes('revenue')) {
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const todaySales = orders.filter(order => {
        const today = new Date();
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      }).reduce((sum, order) => sum + order.total, 0);
      
      return `Here's your sales overview:\n\n• Total Revenue: $${totalRevenue.toFixed(2)}\n• Today's Sales: $${todaySales.toFixed(2)}\n• Total Orders: ${orders.length}\n\nYour top-selling category is Electronics. Consider promoting these items to increase sales!`;
    }
    
    // Inventory insights
    if (input.includes('inventory') || input.includes('stock')) {
      const lowStockProducts = products.filter(p => p.stock <= p.minStock);
      const outOfStockProducts = products.filter(p => p.stock === 0);
      
      return `Inventory Status:\n\n• Total Products: ${products.length}\n• Low Stock Items: ${lowStockProducts.length}\n• Out of Stock: ${outOfStockProducts.length}\n\n${lowStockProducts.length > 0 ? `⚠️ Consider restocking: ${lowStockProducts.map(p => p.name).join(', ')}` : '✅ All products are well stocked!'}`;
    }
    
    // Customer insights
    if (input.includes('customer') || input.includes('client')) {
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(c => c.purchaseCount > 0).length;
      const topCustomer = customers.reduce((prev, current) => 
        prev.totalSpent > current.totalSpent ? prev : current
      );
      
      return `Customer Insights:\n\n• Total Customers: ${totalCustomers}\n• Active Customers: ${activeCustomers}\n• Top Customer: ${topCustomer.name} ($${topCustomer.totalSpent.toFixed(2)})\n\nConsider implementing a loyalty program to increase customer retention!`;
    }
    
    // Cart information
    if (input.includes('cart') || input.includes('basket')) {
      const cartItems = cart.items.length;
      const cartTotal = cart.total;
      
      return `Current Cart Status:\n\n• Items in Cart: ${cartItems}\n• Total Amount: $${cartTotal.toFixed(2)}\n\n${cartItems > 0 ? 'Ready for checkout!' : 'Cart is empty. Add some products to get started.'}`;
    }
    
    // General help
    if (input.includes('help') || input.includes('what can you do')) {
      return `I can help you with:\n\n📊 Sales Analytics - Ask about revenue, sales trends\n📦 Inventory Management - Check stock levels, low stock alerts\n👥 Customer Insights - Customer data, purchase history\n🛒 Cart Information - Current cart status\n📈 Business Recommendations - AI-powered suggestions\n\nJust ask me anything about your business!`;
    }
    
    // Default response
    return `I understand you're asking about "${userInput}". I can help you with sales analytics, inventory management, customer insights, or general business questions. Could you be more specific about what you'd like to know?`;
  };

  const quickActions = [
    { title: 'Today\'s Sales', query: 'What are today\'s sales?' },
    { title: 'Low Stock', query: 'Show me low stock items' },
    { title: 'Top Customers', query: 'Who are my top customers?' },
    { title: 'Cart Status', query: 'What\'s in my cart?' },
  ];

  const MessageBubble = ({ message }: { message: ChatMessage }) => (
    <View className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[80%] p-3 rounded-2xl ${
        message.isUser 
          ? 'bg-primary-600' 
          : 'bg-gray-200'
      }`}>
        <Text className={`text-base ${
          message.isUser ? 'text-white' : 'text-gray-900'
        }`}>
          {message.text}
        </Text>
        <Text className={`text-xs mt-1 ${
          message.isUser ? 'text-primary-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="chatbubble" size={20} color="#3b82f6" />
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-900">AI Assistant</Text>
            <Text className="text-sm text-gray-500">Your business intelligence companion</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-700 mb-2">Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setInputText(action.query)}
                className="bg-primary-50 border border-primary-200 rounded-full px-3 py-1"
              >
                <Text className="text-sm text-primary-700">{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-3"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <View className="mb-4 items-start">
            <View className="bg-gray-200 p-3 rounded-2xl">
              <Text className="text-gray-500">AI is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="flex-row items-center space-x-2">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base text-gray-900"
            placeholder="Ask me anything about your business..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              inputText.trim() && !isTyping
                ? 'bg-primary-600'
                : 'bg-gray-300'
            }`}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() && !isTyping ? 'white' : '#9ca3af'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
