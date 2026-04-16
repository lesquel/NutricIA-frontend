/**
 * DayCard — shows a single day's planned meals with macro progress.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/shared/components/ui/Card';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import type { PlannedMeal, Macros } from '@/shared/types/api';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const MEAL_LABELS: Record<PlannedMeal['meal_type'], string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  snack: 'Merienda',
  dinner: 'Cena',
};

const MEAL_ICONS: Record<PlannedMeal['meal_type'], keyof typeof MaterialIcons.glyphMap> = {
  breakfast: 'free-breakfast',
  lunch: 'lunch-dining',
  snack: 'apple',
  dinner: 'dinner-dining',
};

export interface DayCardProps {
  date: Date;
  dayOfWeek: number;
  meals: PlannedMeal[];
  targetCalories: number;
  targetMacros: Macros;
  onMealPress: (meal: PlannedMeal) => void;
}

export function DayCard({ date, dayOfWeek, meals, targetCalories, targetMacros, onMealPress }: DayCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.macros.protein_g, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.macros.carbs_g, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.macros.fat_g, 0);

  const caloriePct = Math.min(targetCalories > 0 ? totalCalories / targetCalories : 0, 1);
  const proteinPct = Math.min(targetMacros.protein_g > 0 ? totalProtein / targetMacros.protein_g : 0, 1);
  const carbsPct = Math.min(targetMacros.carbs_g > 0 ? totalCarbs / targetMacros.carbs_g : 0, 1);
  const fatPct = Math.min(targetMacros.fat_g > 0 ? totalFat / targetMacros.fat_g : 0, 1);

  const dayName = DAY_NAMES[dayOfWeek] ?? `Día ${dayOfWeek + 1}`;
  const dateStr = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

  const isToday = (() => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  })();

  return (
    <View style={styles.wrapper}>
      <Card padding="md" elevated>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.dayName, { color: isToday ? colors.primary : colors.text }]}>
              {dayName}
            </Text>
            {isToday && (
              <View style={[styles.todayBadge, { backgroundColor: colors.primary + '22' }]}>
                <Text style={[styles.todayText, { color: colors.primary }]}>Hoy</Text>
              </View>
            )}
          </View>
          <Text style={[styles.dateStr, { color: colors.textMuted }]}>{dateStr}</Text>
        </View>

        {/* Macro progress bars */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              {Math.round(totalCalories)} / {targetCalories} kcal
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.calorieOrange, width: `${caloriePct * 100}%` }]} />
          </View>
          <View style={styles.macroBarRow}>
            <View style={[styles.macroTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.macroFill, { backgroundColor: colors.proteinBlue, width: `${proteinPct * 100}%` }]} />
            </View>
            <View style={[styles.macroTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.macroFill, { backgroundColor: colors.carbsAmber, width: `${carbsPct * 100}%` }]} />
            </View>
            <View style={[styles.macroTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.macroFill, { backgroundColor: colors.fatPurple, width: `${fatPct * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* Meal list */}
        <View style={styles.mealList}>
          {meals.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin comidas planificadas</Text>
          ) : (
            meals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={[styles.mealRow, { borderColor: colors.border }]}
                onPress={() => onMealPress(meal)}
                activeOpacity={0.75}
              >
                <View style={[styles.mealIconWrap, { backgroundColor: colors.primary + '18' }]}>
                  <MaterialIcons name={MEAL_ICONS[meal.meal_type]} size={16} color={colors.primary} />
                </View>
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealType, { color: colors.textMuted }]}>
                    {MEAL_LABELS[meal.meal_type]}
                  </Text>
                  <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>
                    {meal.recipe_name}
                  </Text>
                </View>
                <View style={styles.mealRight}>
                  <Text style={[styles.mealCalories, { color: colors.calorieOrange }]}>
                    {meal.calories} kcal
                  </Text>
                  {meal.is_logged && (
                    <MaterialIcons name="check-circle" size={16} color={colors.success} style={styles.checkIcon} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dayName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  todayBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  todayText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  dateStr: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroBarRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 2,
  },
  macroTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 2,
  },
  mealList: {
    gap: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  mealIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 1,
  },
  mealRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  mealCalories: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  checkIcon: {
    marginTop: 2,
  },
});
