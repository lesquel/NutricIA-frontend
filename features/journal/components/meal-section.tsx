/**
 * Meal section header + list for the Journal screen.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MealCard } from '@/shared/components/meal-card';
import type { MealResponse } from '@/shared/types/api';

type Props = {
  title: string;
  icon: string;
  meals: MealResponse[];
  totalKcal: number;
  onAddPress?: () => void;
};

export function MealSection({ title, icon, meals, totalKcal, onAddPress }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={18} color={colors.textMuted} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        {totalKcal > 0 && (
          <Text style={[styles.kcal, { color: colors.textMuted }]}>{totalKcal} kcal</Text>
        )}
      </View>

      {meals.length > 0 ? (
        meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={{
              id: meal.id,
              name: meal.name,
              mealType: meal.meal_type,
              time: new Date(meal.logged_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              calories: meal.calories,
              tag: meal.tags[0],
            }}
          />
        ))
      ) : (
        <TouchableOpacity
          style={[styles.emptyCard, { borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={onAddPress}
        >
          <MaterialIcons name="add" size={24} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Add {title}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: FontSize.base, fontWeight: '700' },
  kcal: { fontSize: FontSize.sm },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 88,
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: FontSize.sm, fontWeight: '500' },
});
