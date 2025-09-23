import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'md',
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  const getModalSize = () => {
    const sizes = {
      sm: { width: screenWidth * 0.8, maxHeight: screenHeight * 0.4 },
      md: { width: screenWidth * 0.9, maxHeight: screenHeight * 0.6 },
      lg: { width: screenWidth * 0.95, maxHeight: screenHeight * 0.8 },
      full: { width: screenWidth, height: screenHeight },
    };
    return sizes[size];
  };
  
  const modalSize = getModalSize();
  
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <Card
          variant="elevated"
          padding="lg"
          style={{
            width: modalSize.width,
            maxHeight: modalSize.maxHeight,
            ...(size === 'full' && { height: modalSize.height }),
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between mb-4">
              {title && (
                <Text className="text-xl font-bold text-gray-900 flex-1">
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  className="p-2 -mr-2"
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Content */}
          <View className="flex-1">
            {children}
          </View>
        </Card>
      </View>
    </RNModal>
  );
};
