import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, FontSize, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DateSelector } from '@/shared/components/date-selector';
import { MealCard } from '@/shared/components/meal-card';
import { useJournalMeals } from '@/features/journal/hooks/use-journal';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function JournalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useJournalMeals();

  const sections = data?.sections ?? [];
  const totalDayCalories = data?.totalCalories ?? 0;
  const calorieGoal = user?.calorie_goal ?? 2200;
  const progress = Math.min(totalDayCalories / calorieGoal, 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Journal</Text>
        <TouchableOpacity style={[styles.calendarBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="calendar-today" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <DateSelector />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialIcons name={section.icon as keyof typeof MaterialIcons.glyphMap} size={18} color={colors.textMuted} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                </View>
                {section.totalKcal > 0 && (
                  <Text style={[styles.sectionKcal, { color: colors.textMuted }]}>
                    {section.totalKcal} kcal
                  </Text>
                )}
              </View>

              {section.meals.length > 0 ? (
                section.meals.map((meal) => <MealCard key={meal.id} meal={meal} />)
              ) : (
                <TouchableOpacity
                  style={[styles.emptyCard, { borderColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => router.push('/scan')}
                >
                  <MaterialIcons name="add" size={24} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Add {section.title}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Floating Total Bar */}
      <View style={styles.totalBarWrapper}>
        <View style={[styles.totalBar, Shadows.soft]}>
          <View style={styles.totalBarTop}>
            <View>
              <Text style={styles.totalLabel}>Daily Nourishment</Text>
              <Text style={styles.totalValue}>
                {totalDayCalories.toLocaleString()}{' '}
                <Text style={styles.totalGoal}>/ {calorieGoal.toLocaleString()} kcal</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.totalAddBtn} onPress={() => router.push('/scan')}>
              <MaterialIcons name="add" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </View>
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
  title: { fontSize: FontSize['3xl'], fontWeight: '700' },
  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '700' },
  sectionKcal: { fontSize: FontSize.sm },
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
  totalBarWrapper: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    zIndex: 30,
  },
  totalBar: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  totalBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, fontWeight: '500' },
  totalValue: { color: '#FFF', fontSize: FontSize.xl, fontWeight: '700', marginTop: 2 },
  totalGoal: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm, fontWeight: '400' },
  totalAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
});
