import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const getCardStyles = () => {
    const baseStyles = 'bg-white rounded-lg';
    
    // Variant styles
    const variantStyles = {
      default: 'shadow-sm',
      elevated: 'shadow-lg',
      outlined: 'border border-gray-200',
    };
    
    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };
    
    return `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]}`;
  };
  
  return (
    <View className={getCardStyles()} style={style}>
      {children}
    </View>
  );
};
