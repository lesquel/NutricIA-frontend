import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, Shadows, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DateSelector } from '@/shared/components/date-selector';
import { MealCard } from '@/shared/components/meal-card';
import { MacroPill } from '@/shared/components/macro-pill';
import { NourishmentRing } from '@/features/dashboard/components/nourishment-ring';
import { useDailySummary, useDailyMeals } from '@/features/dashboard/hooks/use-dashboard';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useWaterLog } from '@/features/garden/hooks/use-garden';
import { useCurrentPlan } from '@/features/planner/hooks/use-current-plan';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const { data: summary, isLoading: summaryLoading } = useDailySummary();
  const { data: meals, isLoading: mealsLoading } = useDailyMeals();
  const { data: waterLog } = useWaterLog();
  const { data: currentPlan } = useCurrentPlan();

  const totalCalories = summary?.total_calories ?? 0;
  const proteinTotal = summary?.total_protein ?? 0;
  const carbsTotal = summary?.total_carbs ?? 0;
  const fatTotal = summary?.total_fat ?? 0;
  const macroTotal = proteinTotal + carbsTotal + fatTotal;
  const proteinPct = macroTotal > 0 ? Math.round((proteinTotal / macroTotal) * 100) : 0;
  const carbsPct = macroTotal > 0 ? Math.round((carbsTotal / macroTotal) * 100) : 0;
  const fatPct = macroTotal > 0 ? Math.round((fatTotal / macroTotal) * 100) : 0;
  const calorieGoal = user?.calorie_goal ?? 2200;
  const waterCups = waterLog?.cups ?? 0;
  const waterGoalCups = waterLog?.goal_cups ?? Math.max(1, Math.round((user?.water_goal_ml ?? 2000) / 250));
  const hydrationProgress = Math.min(waterCups / waterGoalCups, 1);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const displayName = user?.name?.split(' ')[0] ?? 'There';
  const isLoading = summaryLoading || mealsLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting}</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={[styles.avatar, { borderColor: colors.surface, backgroundColor: colors.surface }]}
        >
          <MaterialIcons name="person" size={28} color={colors.primary} />
          <View style={[styles.onlineDot, { backgroundColor: colors.primary, borderColor: colors.background }]} />
        </TouchableOpacity>
      </View>

      <DateSelector />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Nourishment Ring */}
        <NourishmentRing totalCalories={totalCalories} calorieGoal={calorieGoal} />

        {/* Macro Pills */}
        <View style={styles.macrosGrid}>
          <MacroPill icon="egg-alt" label="Protein" value={`${Math.round(proteinTotal)}g (${proteinPct}%)`} />
          <MacroPill icon="grain" label="Carbs" value={`${Math.round(carbsTotal)}g (${carbsPct}%)`} />
          <MacroPill icon="water-drop" label="Fats" value={`${Math.round(fatTotal)}g (${fatPct}%)`} />
        </View>

        <View style={[styles.hydrationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.hydrationHeader}>
            <View style={styles.hydrationTitleRow}>
              <MaterialIcons name="water-drop" size={20} color={colors.waterBlue} />
              <Text style={[styles.hydrationTitle, { color: colors.text }]}>Hydration</Text>
            </View>
            <Text style={[styles.hydrationValue, { color: colors.textMuted }]}>{waterCups}/{waterGoalCups} cups</Text>
          </View>
          <View style={[styles.hydrationTrack, { backgroundColor: colors.border }]}> 
            <View
              style={[
                styles.hydrationFill,
                { backgroundColor: colors.waterBlue, width: `${hydrationProgress * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Today's Nourishment */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today&apos;s Nourishment</Text>
          <TouchableOpacity onPress={() => router.push('/journal')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />
        ) : meals && meals.length > 0 ? (
          meals.slice(0, 5).map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/scan')}
            style={[styles.emptyState, { borderColor: colors.border }]}
          >
            <MaterialIcons name="add-circle-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No meals logged yet — tap to scan your first meal
            </Text>
          </TouchableOpacity>
        )}

        {/* Planner Widget */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Plan de la semana</Text>
          <TouchableOpacity onPress={() => router.push('/planner')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>Ver semana</Text>
          </TouchableOpacity>
        </View>

        {!currentPlan ? (
          <TouchableOpacity
            onPress={() => router.push('/planner')}
            style={[styles.plannerEmptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MaterialIcons name="calendar-today" size={28} color={colors.primary} />
            <View style={styles.plannerEmptyText}>
              <Text style={[styles.plannerEmptyTitle, { color: colors.text }]}>
                Aún no tenés un plan
              </Text>
              <Text style={[styles.plannerEmptySubtitle, { color: colors.textMuted }]}>
                Generá tu plan semanal personalizado
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.plannerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {(() => {
              const today = new Date();
              const todayDow = (today.getDay() + 6) % 7; // Mon=0..Sun=6
              const todayMeals = currentPlan.meals.filter((m) => m.day_of_week === todayDow);
              const MEAL_LABELS: Record<string, string> = {
                breakfast: 'Desayuno',
                lunch: 'Almuerzo',
                snack: 'Merienda',
                dinner: 'Cena',
              };
              return (
                <>
                  {todayMeals.length === 0 ? (
                    <Text style={[styles.plannerNoMeals, { color: colors.textMuted }]}>
                      No hay comidas planificadas para hoy
                    </Text>
                  ) : (
                    todayMeals.slice(0, 4).map((meal) => (
                      <View key={meal.id} style={[styles.plannerMealRow, { borderBottomColor: colors.border }]}>
                        <View style={styles.plannerMealLeft}>
                          <Text style={[styles.plannerMealType, { color: colors.textMuted }]}>
                            {MEAL_LABELS[meal.meal_type] ?? meal.meal_type}
                          </Text>
                          <Text style={[styles.plannerMealName, { color: colors.text }]} numberOfLines={1}>
                            {meal.recipe_name}
                          </Text>
                        </View>
                        <View style={styles.plannerMealRight}>
                          <Text style={[styles.plannerMealCal, { color: colors.calorieOrange }]}>
                            {meal.calories} kcal
                          </Text>
                          {meal.is_logged && (
                            <MaterialIcons name="check-circle" size={14} color={colors.success} />
                          )}
                        </View>
                      </View>
                    ))
                  )}
                  <TouchableOpacity
                    style={[styles.plannerViewAll, { borderTopColor: colors.border }]}
                    onPress={() => router.push('/planner')}
                  >
                    <Text style={[styles.plannerViewAllText, { color: colors.primary }]}>Ver semana completa</Text>
                    <MaterialIcons name="chevron-right" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent, ...Shadows.glow }]}
        onPress={() => router.push('/scan')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  greeting: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  userName: { fontSize: FontSize['3xl'], fontWeight: '700', marginTop: 2 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  scrollContent: { paddingBottom: 40 },
  macrosGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  hydrationCard: {
    marginHorizontal: 24,
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  hydrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  hydrationTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hydrationTitle: { fontSize: FontSize.base, fontWeight: '700' },
  hydrationValue: { fontSize: FontSize.sm, fontWeight: '600' },
  hydrationTrack: {
    height: 7,
    borderRadius: 8,
    overflow: 'hidden',
  },
  hydrationFill: { height: '100%', borderRadius: 8 },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  viewAll: { fontSize: FontSize.sm, fontWeight: '500' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 120,
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: FontSize.sm, fontWeight: '500', textAlign: 'center', paddingHorizontal: 24 },
  plannerEmptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: 24,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 16,
  },
  plannerEmptyText: { flex: 1 },
  plannerEmptyTitle: { fontSize: FontSize.base, fontWeight: '700' },
  plannerEmptySubtitle: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 2 },
  plannerCard: {
    marginHorizontal: 24,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  plannerMealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  plannerMealLeft: { flex: 1 },
  plannerMealType: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  plannerMealName: { fontSize: FontSize.sm, fontWeight: '600', marginTop: 1 },
  plannerMealRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  plannerMealCal: { fontSize: FontSize.xs, fontWeight: '700' },
  plannerNoMeals: { fontSize: FontSize.sm, textAlign: 'center', padding: 16 },
  plannerViewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  plannerViewAllText: { fontSize: FontSize.sm, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
});
