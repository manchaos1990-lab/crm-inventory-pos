import React, { useState } from 'react';
import { TextInput, View, Text, TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const getContainerStyles = () => {
    const baseStyles = 'relative';
    return `${baseStyles}`;
  };
  
  const getInputContainerStyles = () => {
    const baseStyles = 'flex-row items-center border rounded-lg bg-white';
    const focusStyles = isFocused ? 'border-primary-500' : 'border-gray-300';
    const errorStyles = error ? 'border-error-500' : '';
    
    return `${baseStyles} ${focusStyles} ${errorStyles}`;
  };
  
  const getInputStyles = () => {
    const baseStyles = 'flex-1 py-3 px-3 text-base text-gray-900';
    const leftIconStyles = leftIcon ? 'pl-10' : '';
    const rightIconStyles = rightIcon ? 'pr-10' : '';
    
    return `${baseStyles} ${leftIconStyles} ${rightIconStyles}`;
  };
  
  return (
    <View className={getContainerStyles()} style={containerStyle}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      
      <View className={getInputContainerStyles()}>
        {leftIcon && (
          <View className="absolute left-3 z-10">
            <Ionicons
              name={leftIcon}
              size={20}
              color={isFocused ? '#3b82f6' : '#9ca3af'}
            />
          </View>
        )}
        
        <TextInput
          className={getInputStyles()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9ca3af"
          style={style}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            className="absolute right-3 z-10"
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={isFocused ? '#3b82f6' : '#9ca3af'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-sm text-error-500 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
};
