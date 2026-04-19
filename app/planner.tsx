/**
 * Planner screen — weekly meal plan view.
 *
 * Stack screen (not a tab). Registered automatically by Expo Router.
 *
 * States:
 * - Loading: skeleton/spinner
 * - No plan: empty state with GeneratePlanForm
 * - Has plan: week header + WeekGrid + regenerate CTA
 *
 * Deep-link contract (for RecipeCard "Reemplazar" flow):
 *   router.push('/planner?planId=xxx&mealId=yyy') — optional, for future use
 *
 * "Reemplazar" from MealActionsSheet navigates to /(tabs)/recipes with:
 *   router.push({ pathname: '/(tabs)/recipes', params: { planId, mealId, prompt } })
 * The recipes screen pre-fills the composer with the prompt.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useCurrentPlan } from '@/features/planner/hooks/use-current-plan';
import { useLogMeal } from '@/features/planner/hooks/use-log-meal';
import { WeekGrid } from '@/features/planner/components/WeekGrid';
import { MealActionsSheet } from '@/features/planner/components/MealActionsSheet';
import { GeneratePlanForm } from '@/features/planner/components/GeneratePlanForm';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { PlannedMeal } from '@/shared/types/api';

export default function PlannerScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { data: plan, isLoading } = useCurrentPlan();
  const logMeal = useLogMeal();

  const [selectedMeal, setSelectedMeal] = useState<PlannedMeal | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  function handleMealPress(meal: PlannedMeal) {
    setSelectedMeal(meal);
  }

  function handleSwap() {
    if (!selectedMeal || !plan) return;
    const dayKeys = ['planner.days.monday', 'planner.days.tuesday', 'planner.days.wednesday', 'planner.days.thursday', 'planner.days.friday', 'planner.days.saturday', 'planner.days.sunday'];
    const dayName = t(dayKeys[selectedMeal.day_of_week] ?? 'planner.days.monday');
    const mealTypeKeyMap = {
      breakfast: 'planner.meals.breakfastLower',
      lunch: 'planner.meals.lunchLower',
      snack: 'planner.meals.snackLower',
      dinner: 'planner.meals.dinnerLower',
    };
    const mealLabel = t(mealTypeKeyMap[selectedMeal.meal_type]);
    const prompt = t('planner.swapPrompt', { meal: mealLabel, day: dayName });

    setSelectedMeal(null);
    router.push({
      pathname: '/(tabs)/recipes',
      params: {
        planId: plan.id,
        mealId: selectedMeal.id,
        prompt,
      },
    });
  }

  function handleLog() {
    if (!selectedMeal || !plan) return;
    logMeal.mutate({ planId: plan.id, mealId: selectedMeal.id });
    setSelectedMeal(null);
  }

  const weekLabel = plan
    ? (() => {
        const start = new Date(plan.week_start + 'T00:00:00');
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const fmt = (d: Date) =>
          d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
        return `${fmt(start)} — ${fmt(end)}`;
      })()
    : '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('planner.headerTitle')}</Text>
        <TouchableOpacity onPress={() => setShowGenerateModal(true)} style={styles.addBtn}>
          <MaterialIcons name="autorenew" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !plan ? (
        /* No plan — show empty state + form */
        <ScrollView contentContainerStyle={styles.emptyScroll}>
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '18' }]}>
              <MaterialIcons name="calendar-today" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('planner.emptyTitle')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {t('planner.emptySubtitle')}
            </Text>
          </View>
          <View style={styles.formWrapper}>
            <GeneratePlanForm />
          </View>
        </ScrollView>
      ) : (
        /* Has plan */
        <View style={styles.flex}>
          {/* Week label */}
          <View style={[styles.weekBar, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="calendar-today" size={16} color={colors.textMuted} />
            <Text style={[styles.weekLabel, { color: colors.textMuted }]}>{weekLabel}</Text>
          </View>

          <WeekGrid plan={plan} onMealPress={handleMealPress} />

          {/* Bottom CTA */}
          <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            <Button
              variant="secondary"
              onPress={() => setShowGenerateModal(true)}
              leftIcon={<MaterialIcons name="autorenew" size={18} color={colors.primary} />}
            >
              {t('planner.generateNew')}
            </Button>
          </View>
        </View>
      )}

      {/* Meal Actions BottomSheet */}
      <MealActionsSheet
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
        onSwap={handleSwap}
        onLog={handleLog}
      />

      {/* Generate Plan Modal */}
      <Modal visible={showGenerateModal} onClose={() => setShowGenerateModal(false)} title={t('planner.newPlanTitle')}>
        <GeneratePlanForm onSuccess={() => setShowGenerateModal(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScroll: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  formWrapper: {
    paddingTop: Spacing.md,
  },
  weekBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  weekLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
});
