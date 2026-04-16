import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewProps,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface BaseCardProps {
  children: React.ReactNode;
  elevated?: boolean;
  padding?: CardPadding;
}

interface PressableCardProps extends BaseCardProps, Omit<PressableProps, 'style' | 'children'> {
  onPress: () => void;
}

interface StaticCardProps extends BaseCardProps, Omit<ViewProps, 'style' | 'children'> {
  onPress?: never;
}

export type CardProps = PressableCardProps | StaticCardProps;

const paddingValues: Record<CardPadding, number> = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 24,
};

export function Card({ children, elevated = false, padding = 'md', onPress, ...rest }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const cardStyle = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
    elevated && Shadows.soft,
    { padding: paddingValues[padding] },
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        onPress={onPress}
        {...(rest as Omit<PressableProps, 'style' | 'children'>)}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...(rest as Omit<ViewProps, 'style' | 'children'>)}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
});
