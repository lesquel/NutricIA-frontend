/**
 * Shared MealCard component.
 * Accepts either a MealResponse (from API) or a simple legacy shape.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontSize, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { MealResponse } from '@/shared/types/api';

type LegacyMeal = {
  id: string;
  name: string;
  mealType: string;
  time: string;
  calories: number;
  tag?: string;
};

type MealCardProps = {
  meal: MealResponse | LegacyMeal;
  onPress?: () => void;
};

function isApiMeal(meal: MealResponse | LegacyMeal): meal is MealResponse {
  return 'food_name' in meal;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function MealCard({ meal, onPress }: MealCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const name = isApiMeal(meal) ? meal.food_name : meal.name;
  const mealType = isApiMeal(meal) ? capitalize(meal.meal_type) : meal.mealType;
  const time = isApiMeal(meal) ? formatTime(meal.created_at) : meal.time;
  const { calories } = meal;
  const tag = isApiMeal(meal) ? meal.tags?.[0] : meal.tag;

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
      <View style={[styles.thumbnail, { backgroundColor: colors.surface }]}>
        <MaterialIcons name="restaurant" size={24} color={colors.textMuted} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {mealType} • {time}
        </Text>
        {tag && (
          <View style={[styles.tagBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
          </View>
        )}
      </View>

      <View style={styles.calorieBox}>
        <Text style={[styles.calorieValue, { color: colors.text }]}>{calories}</Text>
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
  info: { flex: 1, gap: 2 },
  name: { fontSize: FontSize.base, fontWeight: '600' },
  meta: { fontSize: FontSize.xs },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  tagText: { fontSize: 10, fontWeight: '700' },
  calorieBox: { alignItems: 'flex-end' },
  calorieValue: { fontSize: FontSize.lg, fontWeight: '700' },
  calorieUnit: { fontSize: FontSize.xs },
});
