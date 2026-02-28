import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, Shadows, FontSize } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DateSelector } from '@/shared/components/date-selector';
import { MealCard } from '@/shared/components/meal-card';
import { MacroPill } from '@/shared/components/macro-pill';
import { NourishmentRing } from '@/features/dashboard/components/nourishment-ring';

const MOCK_MEALS = [
  { id: '1', name: 'Avocado Toast', mealType: 'Breakfast', time: '8:30 AM', calories: 350 },
  { id: '2', name: 'Green Bowl', mealType: 'Lunch', time: '12:45 PM', calories: 420 },
  { id: '3', name: 'Raw Almonds', mealType: 'Snack', time: '4:00 PM', calories: 150 },
];

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const totalCalories = 1240;
  const calorieGoal = 2200;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting}</Text>
          <Text style={[styles.userName, { color: colors.text }]}>Alex</Text>
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
          <MacroPill icon="egg-alt" label="Protein" value="60g" />
          <MacroPill icon="grain" label="Carbs" value="120g" />
          <MacroPill icon="water-drop" label="Fats" value="45g" />
        </View>

        {/* Today's Nourishment */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Nourishment</Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {MOCK_MEALS.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}

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
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  viewAll: { fontSize: FontSize.sm, fontWeight: '500' },
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
