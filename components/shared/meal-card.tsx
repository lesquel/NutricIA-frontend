import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontSize, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MealCardProps = {
  meal: {
    id: string;
    name: string;
    mealType: string;
    time: string;
    calories: number;
    tag?: string;
  };
  onPress?: () => void;
};

export function MealCard({ meal, onPress }: MealCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.white,
          borderColor: colors.border + '4D',
          ...Shadows.sm,
        },
      ]}
    >
      {/* Thumbnail placeholder */}
      <View style={[styles.thumbnail, { backgroundColor: colors.surface }]}>
        <MaterialIcons name="restaurant" size={24} color={colors.textMuted} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {meal.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {meal.mealType} • {meal.time}
        </Text>
        {meal.tag && (
          <View style={[styles.tagBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{meal.tag}</Text>
          </View>
        )}
      </View>

      <View style={styles.calorieBox}>
        <Text style={[styles.calorieValue, { color: colors.text }]}>{meal.calories}</Text>
        <Text style={[styles.calorieUnit, { color: colors.textMuted }]}>kcal</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: FontSize.base, fontWeight: '600' },
  meta: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 2 },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  tagText: { fontSize: 10, fontWeight: '600' },
  calorieBox: { alignItems: 'flex-end', paddingRight: 4 },
  calorieValue: { fontSize: FontSize.sm, fontWeight: '700' },
  calorieUnit: { fontSize: FontSize.xs },
});
