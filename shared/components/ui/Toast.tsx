import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, FontSize, Shadows, type ThemeColors } from '@/constants/theme';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

const VARIANT_ICONS: Record<ToastVariant, keyof typeof MaterialIcons.glyphMap> = {
  success: 'check-circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

function getVariantColor(colors: ThemeColors, variant: ToastVariant): string {
  switch (variant) {
    case 'success': return colors.success;
    case 'error': return colors.error;
    case 'warning': return colors.warning;
    case 'info': return colors.info;
  }
}

export function Toast({ item, onDismiss }: ToastProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);
  const gestureTranslateY = useSharedValue(0);

  const variantColor = getVariantColor(colors, item.variant);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-80, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)(item.id);
      }
    });
  }, [translateY, opacity, onDismiss, item.id]);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });

    const timer = setTimeout(() => {
      dismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [dismiss, translateY, opacity]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY < 0) {
        gestureTranslateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY < -40) {
        translateY.value = withTiming(-120, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(onDismiss)(item.id);
          }
        });
      } else {
        gestureTranslateY.value = withSpring(0);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value + gestureTranslateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.toast, { backgroundColor: colors.surface, ...Shadows.soft }, animStyle]}>
        <View style={[styles.accent, { backgroundColor: variantColor }]} />
        <MaterialIcons name={VARIANT_ICONS[item.variant]} size={20} color={variantColor} />
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Pressable onPress={dismiss} hitSlop={8}>
          <MaterialIcons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  message: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '500',
    lineHeight: 18,
  },
});
