import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Image, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, FontSize, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DateSelector } from '@/shared/components/date-selector';
import { MealCard } from '@/shared/components/meal-card';
import { resolveMediaUrl } from '../../shared/lib/media-url';
import { useJournalMeals, useMealCalendar } from '@/features/journal/hooks/use-journal';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useDateStore } from '@/shared/store/date.store';
import type { MealResponse } from '@/shared/types/api';

function toMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function JournalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const selectedDate = useDateStore((s) => s.selectedDate);
  const setSelectedDate = useDateStore((s) => s.setSelectedDate);

  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useJournalMeals();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [detailMeal, setDetailMeal] = useState<MealResponse | null>(null);
  const [monthCursor, setMonthCursor] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const monthKey = toMonthKey(monthCursor);
  const { data: calendarData } = useMealCalendar(monthKey);
  const enabledDays = useMemo(() => new Set(calendarData?.registered_dates ?? []), [calendarData]);

  const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
  const firstWeekDay = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1).getDay();

  const sections = data?.sections ?? [];
  const totalDayCalories = data?.totalCalories ?? 0;
  const calorieGoal = user?.calorie_goal ?? 2200;
  const progress = Math.min(totalDayCalories / calorieGoal, 1);

  const mealDetail = detailMeal
    ? {
        totalMacros: detailMeal.protein_g + detailMeal.carbs_g + detailMeal.fat_g,
      }
    : null;

  const mealPercentages = mealDetail && mealDetail.totalMacros > 0
    ? {
        protein: Math.round((detailMeal!.protein_g / mealDetail.totalMacros) * 100),
        carbs: Math.round((detailMeal!.carbs_g / mealDetail.totalMacros) * 100),
        fat: Math.round((detailMeal!.fat_g / mealDetail.totalMacros) * 100),
      }
    : { protein: 0, carbs: 0, fat: 0 };

  const detailImageUrl = resolveMediaUrl(detailMeal?.image_url);
  const detailModalVisible = detailMeal !== null;

  const detailSheet = (
    <View style={[styles.detailModal, Platform.OS === 'web' && styles.webDetailModal, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
      <View style={styles.detailHeader}>
        <Text style={[styles.detailTitle, { color: colors.text }]}>Meal Details</Text>
        <TouchableOpacity onPress={() => setDetailMeal(null)} style={[styles.detailClose, { backgroundColor: colors.background }]}> 
          <MaterialIcons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
        {detailImageUrl ? (
          <Image source={{ uri: detailImageUrl }} style={styles.detailImage} />
        ) : (
          <View style={[styles.detailImagePlaceholder, { backgroundColor: colors.background }]}> 
            <MaterialIcons name="restaurant" size={36} color={colors.textMuted} />
          </View>
        )}

        <Text style={[styles.detailMealName, { color: colors.text }]}>{detailMeal?.name}</Text>
        <Text style={[styles.detailMealMeta, { color: colors.textMuted }]}> 
          {detailMeal?.meal_type} • {detailMeal ? new Date(detailMeal.logged_at).toLocaleString() : ''}
        </Text>

        {!!detailMeal?.tags?.length && (
          <View style={styles.tagRow}>
            {detailMeal.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={[styles.detailTag, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.detailTagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.detailStatsCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Calories</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{detailMeal?.calories ?? 0} kcal</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Protein</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{detailMeal?.protein_g ?? 0}g ({mealPercentages.protein}%)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Carbs</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{detailMeal?.carbs_g ?? 0}g ({mealPercentages.carbs}%)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Fat</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{detailMeal?.fat_g ?? 0}g ({mealPercentages.fat}%)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>AI Confidence</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}> 
              {Math.round((detailMeal?.confidence_score ?? 0) * 100)}%
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
          onPress={() => setDetailMeal(null)}
        >
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Journal</Text>
        <TouchableOpacity
          style={[styles.calendarBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setCalendarOpen(true)}
        >
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
                section.meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} onPress={() => setDetailMeal(meal)} />
                ))
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

      <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarModal, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={[styles.monthNavBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                onPress={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
              >
                <MaterialIcons name="chevron-left" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.calendarTitle, { color: colors.text }]}> 
                {monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                style={[styles.monthNavBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                onPress={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
              >
                <MaterialIcons name="chevron-right" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.calendarSummary, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.calendarSummaryItem}>
                <Text style={[styles.calendarSummaryLabel, { color: colors.textMuted }]}>Days with meals</Text>
                <Text style={[styles.calendarSummaryValue, { color: colors.text }]}>{enabledDays.size}</Text>
              </View>
              <View style={styles.calendarSummaryDivider} />
              <View style={styles.calendarSummaryItem}>
                <Text style={[styles.calendarSummaryLabel, { color: colors.textMuted }]}>Selected date</Text>
                <Text style={[styles.calendarSummaryValue, { color: colors.text }]}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>

            <View style={styles.weekHeaderRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <Text key={day} style={[styles.weekHeaderText, { color: colors.textMuted }]}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {Array.from({ length: firstWeekDay }).map((_, idx) => (
                <View key={`pad-${idx}`} style={styles.dayCell} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const y = monthCursor.getFullYear();
                const m = String(monthCursor.getMonth() + 1).padStart(2, '0');
                const d = String(dayNumber).padStart(2, '0');
                const dateKey = `${y}-${m}-${d}`;
                const enabled = enabledDays.has(dateKey);
                const isSelected =
                  selectedDate.getFullYear() === y &&
                  selectedDate.getMonth() === monthCursor.getMonth() &&
                  selectedDate.getDate() === dayNumber;

                return (
                  <TouchableOpacity
                    key={dateKey}
                    disabled={!enabled}
                    style={[
                      styles.dayCell,
                      styles.dayButton,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                        opacity: enabled ? 1 : 0.35,
                      },
                    ]}
                    onPress={() => {
                      if (!enabled) return;
                      setSelectedDate(new Date(y, monthCursor.getMonth(), dayNumber));
                      setCalendarOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: isSelected ? '#FFF' : colors.text },
                      ]}
                    >
                      {dayNumber}
                    </Text>
                    {enabled && !isSelected && (
                      <View style={[styles.dayDot, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.calendarHint, { color: colors.textMuted }]}> 
              Days without meals are disabled.
            </Text>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
              onPress={() => setCalendarOpen(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {Platform.OS === 'web' ? (
        detailModalVisible ? (
          <Pressable style={[styles.modalOverlay, styles.webModalOverlay]} onPress={() => setDetailMeal(null)}>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
              }}
            >
              {detailSheet}
            </Pressable>
          </Pressable>
        ) : null
      ) : (
        <Modal visible={detailModalVisible} transparent animationType="slide" onRequestClose={() => setDetailMeal(null)}>
          <View style={styles.modalOverlay}>
            {detailSheet}
          </View>
        </Modal>
      )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  webModalOverlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 200,
  },
  calendarModal: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
  },
  calendarSummary: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarSummaryItem: { flex: 1, gap: 3 },
  calendarSummaryDivider: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(138,148,143,0.35)', marginHorizontal: 10 },
  calendarSummaryLabel: { fontSize: FontSize.xs, fontWeight: '600' },
  calendarSummaryValue: { fontSize: FontSize.base, fontWeight: '700' },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: { fontSize: FontSize.base, fontWeight: '700' },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  weekHeaderText: { width: 34, textAlign: 'center', fontSize: FontSize.xs, fontWeight: '600' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayCell: { width: 34, height: 34 },
  dayButton: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: FontSize.sm, fontWeight: '600' },
  dayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  calendarHint: { marginTop: 12, fontSize: FontSize.xs },
  closeBtn: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeBtnText: { color: '#FFF', fontSize: FontSize.sm, fontWeight: '700' },
  detailModal: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    maxHeight: '86%',
  },
  webDetailModal: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  detailContent: { paddingBottom: 4 },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  detailClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 10 },
  detailImagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailMealName: { fontSize: FontSize.xl, fontWeight: '700' },
  detailMealMeta: { fontSize: FontSize.sm, marginBottom: 12 },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailTagText: { fontSize: FontSize.xs, fontWeight: '700' },
  detailStatsCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: { fontSize: FontSize.sm },
  detailValue: { fontSize: FontSize.sm, fontWeight: '700' },
});
