import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getButtonStyles = () => {
    const baseStyles = 'flex-row items-center justify-center rounded-lg';
    
    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
    };
    
    // Variant styles
    const variantStyles = {
      primary: disabled 
        ? 'bg-gray-300' 
        : 'bg-primary-600 active:bg-primary-700',
      secondary: disabled 
        ? 'bg-gray-200' 
        : 'bg-secondary-100 active:bg-secondary-200',
      outline: disabled 
        ? 'border border-gray-300 bg-transparent' 
        : 'border border-primary-600 bg-transparent active:bg-primary-50',
      danger: disabled 
        ? 'bg-gray-300' 
        : 'bg-error-600 active:bg-error-700',
    };
    
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
  };
  
  const getTextStyles = () => {
    const baseStyles = 'font-semibold text-center';
    
    // Size styles
    const sizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };
    
    // Variant styles
    const variantStyles = {
      primary: disabled ? 'text-gray-500' : 'text-white',
      secondary: disabled ? 'text-gray-500' : 'text-secondary-700',
      outline: disabled ? 'text-gray-500' : 'text-primary-600',
      danger: disabled ? 'text-gray-500' : 'text-white',
    };
    
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
  };
  
  const getIconSize = () => {
    const sizeMap = {
      sm: 16,
      md: 20,
      lg: 24,
    };
    return sizeMap[size];
  };
  
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Ionicons
        name={icon}
        size={getIconSize()}
        color={disabled ? '#9ca3af' : variant === 'outline' ? '#2563eb' : '#ffffff'}
        style={{ marginRight: iconPosition === 'left' ? 8 : 0, marginLeft: iconPosition === 'right' ? 8 : 0 }}
      />
    );
  };
  
  return (
    <TouchableOpacity
      className={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? '#2563eb' : '#ffffff'} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && renderIcon()}
          <Text className={getTextStyles()} style={textStyle}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
};
