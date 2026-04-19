/**
 * Nourishment Ring — calorie progress circle for the Dashboard.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Colors, FontSize } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  totalCalories: number;
  calorieGoal: number;
  size?: number;
  strokeWidth?: number;
};

export function NourishmentRing({
  totalCalories,
  calorieGoal,
  size = 260,
  strokeWidth = 12,
}: Props) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const progress = Math.min(totalCalories / calorieGoal, 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { height: size + 20 }]}>
      <View style={[styles.blob, { backgroundColor: colors.primary + '08' }]} />
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <MaterialIcons name="spa" size={32} color={colors.primary} />
        <Text style={[styles.calories, { color: colors.text }]}>
          {totalCalories.toLocaleString()}
        </Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('tabs.home.kcalNourished')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  blob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  svg: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  calories: {
    fontSize: FontSize['5xl'],
    fontWeight: '600',
    letterSpacing: -1,
    marginTop: 4,
  },
  label: { fontSize: FontSize.sm, fontWeight: '500', marginTop: 2 },
});
