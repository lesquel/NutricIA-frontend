/**
 * RecipeCard — renders a structured recipe suggestion from the AI.
 *
 * Displays: name, macro pills, cook time + difficulty + servings,
 * ingredients list, numbered steps.
 *
 * onSave: if user has no current plan, shows a toast with navigation CTA.
 * If user has a plan, shows a BottomSheet slot picker (day + meal_type) and
 * calls useSwapMeal to save into the first matching non-logged slot.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { useToast } from '@/shared/hooks/use-toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useCurrentPlan } from '@/features/planner/hooks/use-current-plan';
import { useSwapMeal } from '@/features/planner/hooks/use-swap-meal';
import type { RecipeCard as RecipeCardType, MealType, PlannedMeal } from '@/shared/types/api';

const DAY_KEYS = [
  'planner.days.monday',
  'planner.days.tuesday',
  'planner.days.wednesday',
  'planner.days.thursday',
  'planner.days.friday',
  'planner.days.saturday',
  'planner.days.sunday',
];
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_LABEL_KEYS: Record<MealType, string> = {
  breakfast: 'planner.meals.breakfast',
  lunch: 'planner.meals.lunch',
  snack: 'planner.meals.snack',
  dinner: 'planner.meals.dinner',
};

export interface RecipeCardProps {
  recipe: RecipeCardType;
  onSave?: (recipe: RecipeCardType) => void;
}

interface MacroPillProps {
  label: string;
  value: string;
  color: string;
}

function MacroPill({ label, value, color }: MacroPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '22' }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={[styles.pillLabel, { color: color + 'CC' }]}>{label}</Text>
    </View>
  );
}

const DIFFICULTY_KEYS: Record<RecipeCardType['difficulty'], string> = {
  easy: 'planner.difficulty.easy',
  medium: 'planner.difficulty.medium',
  hard: 'planner.difficulty.hard',
};

export function RecipeCard({ recipe, onSave }: RecipeCardProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const toast = useToast();
  const router = useRouter();

  const { data: plan } = useCurrentPlan();
  const swapMeal = useSwapMeal();

  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');

  function handleSave() {
    if (onSave) {
      onSave(recipe);
      return;
    }

    if (!plan) {
      toast.info(t('tabs.recipes.generatePlanFirst'));
      // Navigate to planner after a short delay so toast is visible
      setTimeout(() => router.push('/planner'), 800);
      return;
    }

    setShowSlotPicker(true);
  }

  function handleConfirmSlot() {
    if (!plan) return;

    // Find the first non-logged slot matching day + meal_type (v1 simplification)
    const slot: PlannedMeal | undefined = plan.meals.find(
      (m) => m.day_of_week === selectedDay && m.meal_type === selectedMealType && !m.is_logged,
    );

    // If no matching slot, use any slot for that day+type (even logged ones)
    const target: PlannedMeal | undefined =
      slot ??
      plan.meals.find((m) => m.day_of_week === selectedDay && m.meal_type === selectedMealType);

    if (!target) {
      toast.warning(t('tabs.recipes.noSlotAvailable'));
      setShowSlotPicker(false);
      return;
    }

    swapMeal.mutate(
      {
        planId: plan.id,
        mealId: target.id,
        body: {
          recipe_name: recipe.name,
          recipe_ingredients: recipe.ingredients,
          calories: recipe.macros_per_serving.calories,
          macros: {
            protein_g: recipe.macros_per_serving.protein_g,
            carbs_g: recipe.macros_per_serving.carbs_g,
            fat_g: recipe.macros_per_serving.fat_g,
          },
          cook_time_minutes: recipe.cook_time_minutes,
          difficulty: recipe.difficulty,
          servings: recipe.servings,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            t('tabs.recipes.recipeSaved', {
              day: t(DAY_KEYS[selectedDay]),
              meal: t(MEAL_LABEL_KEYS[selectedMealType]),
            }),
          );
          setShowSlotPicker(false);
        },
      },
    );
  }

  const { macros_per_serving: macros } = recipe;

  return (
    <View style={styles.card}>
    <Card padding="md" elevated>
      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>{recipe.name}</Text>

      {/* Macros row */}
      <View style={styles.macrosRow}>
        <MacroPill
          label={t('tabs.recipes.macroKcal')}
          value={String(Math.round(macros.calories))}
          color={colors.calorieOrange}
        />
        <MacroPill
          label={t('tabs.recipes.macroProtein')}
          value={`${macros.protein_g.toFixed(1)}g`}
          color={colors.proteinBlue}
        />
        <MacroPill
          label={t('tabs.recipes.macroCarbs')}
          value={`${macros.carbs_g.toFixed(1)}g`}
          color={colors.carbsAmber}
        />
        <MacroPill
          label={t('tabs.recipes.macroFat')}
          value={`${macros.fat_g.toFixed(1)}g`}
          color={colors.fatPurple}
        />
      </View>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="schedule" size={14} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {recipe.cook_time_minutes} min
          </Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="bar-chart" size={14} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {t(DIFFICULTY_KEYS[recipe.difficulty])}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="people" size={14} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {recipe.servings} {recipe.servings === 1 ? t('planner.actions.servingSingular') : t('planner.actions.servingPlural')}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Ingredients */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('tabs.recipes.ingredients')}</Text>
      {recipe.ingredients.map((ingredient, i) => (
        <View key={i} style={styles.listItem}>
          <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
          <Text style={[styles.listText, { color: colors.text }]}>{ingredient}</Text>
        </View>
      ))}

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Steps */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('tabs.recipes.preparation')}</Text>
      {recipe.steps.map((step, i) => (
        <View key={i} style={styles.stepItem}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>{i + 1}</Text>
          </View>
          <Text style={[styles.listText, { color: colors.text, flex: 1 }]}>{step}</Text>
        </View>
      ))}

      {/* Save button */}
      <Button
        variant="secondary"
        size="sm"
        style={styles.saveButton}
        onPress={handleSave}
        leftIcon={<MaterialIcons name="bookmark-border" size={16} color={colors.primary} />}
      >
        {t('tabs.recipes.saveRecipe')}
      </Button>
    </Card>

    {/* Slot picker BottomSheet */}
    <BottomSheet visible={showSlotPicker} onClose={() => setShowSlotPicker(false)} snapPoints={['55%']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.slotTitle, { color: colors.text }]}>{t('tabs.recipes.forWhichDay')}</Text>

        <Text style={[styles.slotLabel, { color: colors.textMuted }]}>{t('tabs.recipes.dayLabel')}</Text>
        <View style={styles.slotChips}>
          {DAY_KEYS.map((dayKey, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDay(i)}
              style={[
                styles.slotChip,
                {
                  backgroundColor: selectedDay === i ? colors.primary : colors.surface,
                  borderColor: selectedDay === i ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.slotChipText, { color: selectedDay === i ? '#FFF' : colors.text }]}>
                {t(dayKey).slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.slotLabel, { color: colors.textMuted }]}>{t('tabs.recipes.mealLabel')}</Text>
        <View style={styles.slotChips}>
          {MEAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedMealType(type)}
              style={[
                styles.slotChip,
                {
                  backgroundColor: selectedMealType === type ? colors.primary : colors.surface,
                  borderColor: selectedMealType === type ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.slotChipText, { color: selectedMealType === type ? '#FFF' : colors.text }]}>
                {t(MEAL_LABEL_KEYS[type])}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          variant="primary"
          style={styles.slotConfirmBtn}
          onPress={handleConfirmSlot}
          loading={swapMeal.isPending}
        >
          {t('tabs.recipes.saveInPlan')}
        </Button>
      </ScrollView>
    </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  pillValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
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
    marginVertical: Spacing.sm,
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
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  slotTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  slotLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  slotChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slotChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  slotChipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  slotConfirmBtn: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
});
