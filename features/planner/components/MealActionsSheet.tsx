/**
 * MealActionsSheet — BottomSheet showing meal details + actions.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { Button } from '@/shared/components/ui/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import type { PlannedMeal } from '@/shared/types/api';

const DIFFICULTY_KEYS: Record<string, string> = {
  easy: 'planner.difficulty.easy',
  medium: 'planner.difficulty.medium',
  hard: 'planner.difficulty.hard',
};

const MEAL_LABEL_KEYS: Record<PlannedMeal['meal_type'], string> = {
  breakfast: 'planner.meals.breakfast',
  lunch: 'planner.meals.lunch',
  snack: 'planner.meals.snack',
  dinner: 'planner.meals.dinner',
};

export interface MealActionsSheetProps {
  meal: PlannedMeal | null;
  onClose: () => void;
  onSwap: () => void;
  onLog: () => void;
}

export function MealActionsSheet({ meal, onClose, onSwap, onLog }: MealActionsSheetProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <BottomSheet visible={meal !== null} onClose={onClose} snapPoints={['65%', '90%']}>
      {meal && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Meal type badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {t(MEAL_LABEL_KEYS[meal.meal_type])}
              </Text>
            </View>
            {meal.is_logged && (
              <View style={[styles.badge, { backgroundColor: colors.success + '22' }]}>
                <MaterialIcons name="check-circle" size={12} color={colors.success} />
                <Text style={[styles.badgeText, { color: colors.success }]}>{t('planner.actions.eaten')}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{meal.recipe_name}</Text>

          {/* Macros row */}
          <View style={styles.macrosRow}>
            <View style={[styles.macroPill, { backgroundColor: colors.calorieOrange + '22' }]}>
              <Text style={[styles.macroValue, { color: colors.calorieOrange }]}>{meal.calories}</Text>
              <Text style={[styles.macroLabel, { color: colors.calorieOrange + 'CC' }]}>kcal</Text>
            </View>
            <View style={[styles.macroPill, { backgroundColor: colors.proteinBlue + '22' }]}>
              <Text style={[styles.macroValue, { color: colors.proteinBlue }]}>{meal.macros.protein_g.toFixed(1)}g</Text>
              <Text style={[styles.macroLabel, { color: colors.proteinBlue + 'CC' }]}>{t('tabs.recipes.macroProtein')}</Text>
            </View>
            <View style={[styles.macroPill, { backgroundColor: colors.carbsAmber + '22' }]}>
              <Text style={[styles.macroValue, { color: colors.carbsAmber }]}>{meal.macros.carbs_g.toFixed(1)}g</Text>
              <Text style={[styles.macroLabel, { color: colors.carbsAmber + 'CC' }]}>{t('tabs.recipes.macroCarbs')}</Text>
            </View>
            <View style={[styles.macroPill, { backgroundColor: colors.fatPurple + '22' }]}>
              <Text style={[styles.macroValue, { color: colors.fatPurple }]}>{meal.macros.fat_g.toFixed(1)}g</Text>
              <Text style={[styles.macroLabel, { color: colors.fatPurple + 'CC' }]}>{t('tabs.recipes.macroFat')}</Text>
            </View>
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            {meal.cook_time_minutes != null && (
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={14} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{meal.cook_time_minutes} min</Text>
              </View>
            )}
            {meal.difficulty != null && (
              <View style={styles.metaItem}>
                <MaterialIcons name="bar-chart" size={14} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{t(DIFFICULTY_KEYS[meal.difficulty] ?? 'planner.difficulty.medium')}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <MaterialIcons name="people" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {meal.servings} {meal.servings === 1 ? t('planner.actions.servingSingular') : t('planner.actions.servingPlural')}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Ingredients */}
          {meal.recipe_ingredients.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('planner.actions.ingredients')}</Text>
              {meal.recipe_ingredients.map((ingredient, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.listText, { color: colors.text }]}>{ingredient}</Text>
                </View>
              ))}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              variant="secondary"
              onPress={onSwap}
              leftIcon={<MaterialIcons name="swap-horiz" size={18} color={colors.primary} />}
              style={styles.actionBtn}
            >
              {t('planner.actions.swap')}
            </Button>
            <Button
              variant="primary"
              onPress={onLog}
              disabled={meal.is_logged}
              leftIcon={<MaterialIcons name="check" size={18} color="#FFF" />}
              style={styles.actionBtn}
            >
              {meal.is_logged ? t('planner.actions.alreadyEaten') : t('planner.actions.markEaten')}
            </Button>
          </View>
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  macroPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 7,
  },
  listText: {
    fontSize: FontSize.base,
    lineHeight: 22,
    flex: 1,
  },
  actions: {
    gap: Spacing.sm,
    paddingBottom: Spacing['2xl'],
  },
  actionBtn: {
    width: '100%',
  },
});
