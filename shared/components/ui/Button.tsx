import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, FontSize, type ThemeColors } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  style?: ViewStyle;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    sizeStyles[size],
    variantStyles(colors)[variant],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    sizeTextStyles[size],
    textColorStyles(colors)[variant],
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={textStyle}>{children}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

function variantStyles(colors: ThemeColors) {
  return StyleSheet.create({
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    destructive: {
      backgroundColor: colors.error,
    },
  });
}

function textColorStyles(colors: ThemeColors) {
  return StyleSheet.create({
    primary: { color: '#FFFFFF' },
    secondary: { color: colors.text },
    ghost: { color: colors.primary },
    destructive: { color: '#FFFFFF' },
  });
}

const sizeStyles = StyleSheet.create({
  sm: { height: 36, paddingHorizontal: 12, borderRadius: BorderRadius.md },
  md: { height: 48, paddingHorizontal: 18, borderRadius: BorderRadius.lg },
  lg: { height: 56, paddingHorizontal: 24, borderRadius: BorderRadius.lg },
});

const sizeTextStyles = StyleSheet.create({
  sm: { fontSize: FontSize.sm, fontWeight: '600' as const },
  md: { fontSize: FontSize.base, fontWeight: '700' as const },
  lg: { fontSize: FontSize.lg, fontWeight: '700' as const },
});

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});
