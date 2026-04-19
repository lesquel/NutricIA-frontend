import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Colors, FontSize, Shadows, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHabits, useCheckInHabit, useWaterLog, useLogWater } from '@/features/garden/hooks/use-garden';
import { DateSelector } from '@/shared/components/date-selector';
import type { HabitResponse, PlantState } from '@/shared/types/api';
import { PLANT_EMOJI, HABIT_SUGGESTIONS } from '@/features/garden/constants';
import { CreateHabitModal } from '@/features/garden/components/CreateHabitModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 24 * 2 - 12) / 2;

export default function GardenScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: waterLog, isLoading: waterLoading } = useWaterLog();
  const logWater = useLogWater();
  const checkInHabit = useCheckInHabit();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalInitialName, setModalInitialName] = useState<string>('');
  const [modalInitialPlant, setModalInitialPlant] = useState<string | undefined>(undefined);

  function openCreateModal(name = '', plantType?: string) {
    setModalInitialName(name);
    setModalInitialPlant(plantType);
    setModalVisible(true);
  }

  const cups = waterLog?.cups ?? 0;
  const totalCups = waterLog?.goal_cups ?? 8;
  const hydrationRatio = totalCups > 0 ? cups / totalCups : 0;
  const todayPlant = hydrationRatio >= 1 ? { emoji: '🌸', label: t('tabs.garden.plantBlooming'), subtitle: t('tabs.garden.hintBlooming') }
    : hydrationRatio >= 0.65 ? { emoji: '🌿', label: t('tabs.garden.plantGrowing'), subtitle: t('tabs.garden.hintGrowing') }
      : hydrationRatio > 0 ? { emoji: '🌱', label: t('tabs.garden.plantSprouting'), subtitle: t('tabs.garden.hintSprouting') }
        : { emoji: '🪴', label: t('tabs.garden.plantNeedsWater'), subtitle: t('tabs.garden.hintNeedsWater') };

  const toggleCup = (index: number) => {
    const newCups = index + 1 === cups ? index : index + 1;
    logWater.mutate(newCups);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerLabel, { color: colors.primary }]}>{t('tabs.garden.growthLabel')}</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tabs.garden.headerTitle')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <MaterialIcons name="notifications-none" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <DateSelector />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Intro explainer */}
        <View
          style={[
            styles.introCard,
            { backgroundColor: colors.primary + '14', borderColor: colors.primary + '33' },
          ]}
        >
          <MaterialIcons name="eco" size={18} color={colors.primary} />
          <Text style={[styles.introText, { color: colors.text }]}>
            {t('tabs.garden.intro')}
          </Text>
        </View>

        {/* Water Tracker */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <MaterialIcons name="water-drop" size={22} color={colors.waterBlue} />
              <View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('tabs.garden.hydration')}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                  {t('tabs.garden.hydrationSubtitle')}
                </Text>
              </View>
            </View>
            <Text style={[styles.cupCount, { color: colors.textMuted }]}>
              {t('tabs.garden.cupsFormat', { cups, total: totalCups })}
            </Text>
          </View>

          {waterLoading ? (
            <ActivityIndicator size="small" color={colors.waterBlue} />
          ) : (
            <View style={styles.cupsRow}>
              {Array.from({ length: totalCups }).map((_, i) => {
                const filled = i < cups;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => toggleCup(i)}
                    style={[
                      styles.cupBtn,
                      {
                        backgroundColor: filled ? colors.waterBlue : colors.background,
                        borderColor: filled ? colors.waterBlue : colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="water-drop"
                      size={20}
                      color={filled ? '#FFFFFF' : colors.waterBlue}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={[styles.todayPlantCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.todayPlantLeft}>
            <View style={[styles.todayPlantEmojiWrap, { backgroundColor: colors.background }]}>
              <Text style={styles.todayPlantEmoji}>{todayPlant.emoji}</Text>
            </View>
            <View>
              <Text style={[styles.todayPlantTitle, { color: colors.text }]}>{t('tabs.garden.todaysPlant')}</Text>
              <Text style={[styles.todayPlantState, { color: colors.primary }]}>{todayPlant.label}</Text>
              <Text style={[styles.todayPlantHint, { color: colors.textMuted }]}>{todayPlant.subtitle}</Text>
            </View>
          </View>
          <Text style={[styles.todayPlantPct, { color: colors.text }]}>{Math.round(Math.min(hydrationRatio, 1) * 100)}%</Text>
        </View>

        {/* Plants Header */}
        <View style={styles.plantsHeader}>
          <View>
            <Text style={[styles.plantsTitle, { color: colors.text }]}>{t('tabs.garden.yourPlants')}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              {t('tabs.garden.plantsSubtitle')}
            </Text>
          </View>
          {(habits ?? []).length > 0 && (
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: colors.primary }]}>{t('tabs.garden.viewAll')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Plant Grid / Empty state */}
        {habitsLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (habits ?? []).length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('tabs.garden.emptyTitle')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {t('tabs.garden.emptySubtitle')}
            </Text>
            <View style={styles.suggestionList}>
              {HABIT_SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.suggestionChip,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    openCreateModal(
                      t(`tabs.garden.suggestions.${s.id}`),
                      s.plantType,
                    )
                  }
                >
                  <Text style={styles.suggestionEmoji}>{s.icon}</Text>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>
                    {t(`tabs.garden.suggestions.${s.id}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.primaryCta, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => openCreateModal()}
            >
              <MaterialIcons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.primaryCtaText}>{t('tabs.garden.plantNewSeed')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.plantsGrid}>
            {(habits ?? []).map((habit) => (
              <PlantCard
                key={habit.id}
                habit={habit}
                colors={colors}
                colorScheme={colorScheme}
                onCheckIn={() => checkInHabit.mutate(habit.id)}
              />
            ))}
            {/* Add New Habit Card */}
            <TouchableOpacity
              style={[
                styles.addCard,
                { borderColor: colors.border, backgroundColor: colors.background },
              ]}
              activeOpacity={0.7}
              onPress={() => openCreateModal()}
            >
              <View
                style={[styles.addIconCircle, { backgroundColor: colors.surface }]}
              >
                <MaterialIcons name="add" size={28} color={colors.textMuted} />
              </View>
              <Text style={[styles.addTitle, { color: colors.textMuted }]}>{t('tabs.garden.plantNewSeed')}</Text>
              <Text style={[styles.addSub, { color: colors.textMuted }]}>{t('tabs.garden.startNewHabit')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <CreateHabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        colors={colors}
        initialName={modalInitialName}
        initialPlantType={modalInitialPlant}
      />
    </SafeAreaView>
  );
}

function PlantCard({
  habit,
  colors,
  colorScheme,
  onCheckIn,
}: {
  habit: HabitResponse;
  colors: typeof Colors[keyof typeof Colors];
  colorScheme: 'light' | 'dark';
  onCheckIn: () => void;
}) {
  const { t } = useTranslation();
  const streak = habit.streak_days;
  const progress = Math.round(habit.progress_percentage);
  const checkedToday = habit.checked_today;
  const isWilted = habit.plant_state === 'wilted';
  const emoji = PLANT_EMOJI[habit.plant_type] ?? PLANT_EMOJI.default;

  return (
    <View
      style={[
        styles.plantCard,
        Shadows.soft,
        {
          backgroundColor: colors.surface,
          borderColor: isWilted ? colors.warning : colors.border,
          borderWidth: isWilted ? 2 : 1,
        },
      ]}
    >
      {/* Streak / State badge */}
      {habit.plant_state === 'healthy' && (
        <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
          <MaterialIcons name="local-fire-department" size={14} color={colors.accent} />
          <Text style={[styles.badgeText, { color: colors.accent }]}>{t('tabs.garden.badgeDays', { count: streak })}</Text>
        </View>
      )}
      {habit.plant_state === 'growing' && (
        <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
          <MaterialIcons name="eco" size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>{t('tabs.garden.badgeDays', { count: streak })}</Text>
        </View>
      )}
      {habit.plant_state === 'wilted' && (
        <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}>
          <MaterialIcons name="warning" size={14} color={colors.error} />
          <Text style={[styles.badgeText, { color: colors.error }]}>{t('tabs.garden.badgeDry')}</Text>
        </View>
      )}

      {/* Plant Emoji */}
      <View style={[styles.plantEmojiContainer, isWilted && { opacity: 0.6 }]}>
        <Text style={styles.plantEmoji}>{emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.plantInfo}>
        <Text style={[styles.plantName, { color: colors.text }]} numberOfLines={1}>
          {habit.name}
        </Text>
        {isWilted ? (
          <Text style={[styles.plantSpecies, { color: colors.error }]}>{t('tabs.garden.needsWater')}</Text>
        ) : (
          <Text style={[styles.plantSpecies, { color: colors.textMuted }]}>
            {habit.plant_type}
          </Text>
        )}
      </View>

      {/* Progress or Revive */}
      {isWilted ? (
        <TouchableOpacity
          style={[styles.reviveBtn, { backgroundColor: `${colors.waterBlue}15` }]}
          activeOpacity={0.7}
          onPress={onCheckIn}
        >
          <MaterialIcons name="water-drop" size={14} color={colors.waterBlue} />
          <Text style={[styles.reviveText, { color: colors.waterBlue }]}>{t('tabs.garden.revive')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={!checkedToday ? onCheckIn : undefined} activeOpacity={checkedToday ? 1 : 0.7}>
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.progressLabelSmall, { color: colors.textMuted }]}>
                {t('tabs.garden.levelShort', { level: habit.level })}
              </Text>
              <Text style={[styles.progressLabelSmall, { color: checkedToday ? colors.primary : colors.textMuted }]}>
                {checkedToday ? t('tabs.garden.doneCheck') : `${progress}%`}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colorScheme === 'dark' ? colors.border : '#ECECEC' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: { fontSize: FontSize['3xl'], fontWeight: '700' },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 24 },

  // Water tracker
  card: {
    borderRadius: BorderRadius.lg,
    padding: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  cardSubtitle: { fontSize: FontSize.xs, marginTop: 1 },
  cupCount: { fontSize: FontSize.sm, fontWeight: '500' },

  // Intro banner
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  introText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },

  // Empty state
  emptyCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: 8,
  },
  suggestionList: {
    alignSelf: 'stretch',
    gap: 8,
    marginVertical: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  suggestionEmoji: { fontSize: 18 },
  suggestionText: { fontSize: FontSize.sm, fontWeight: '600' },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    marginTop: 6,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  cupsRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  cupBtn: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Plants
  plantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 14,
  },
  todayPlantCard: {
    marginTop: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayPlantLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  todayPlantEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayPlantEmoji: { fontSize: 28 },
  todayPlantTitle: { fontSize: FontSize.base, fontWeight: '700' },
  todayPlantState: { fontSize: FontSize.sm, fontWeight: '700', marginTop: 1 },
  todayPlantHint: { fontSize: FontSize.xs, marginTop: 1 },
  todayPlantPct: { fontSize: FontSize.xl, fontWeight: '700' },
  plantsTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  viewAll: { fontSize: FontSize.sm, fontWeight: '600' },
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  plantCard: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.lg,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    zIndex: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  plantEmojiContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  plantEmoji: { fontSize: 56 },
  plantInfo: { gap: 2, marginBottom: 10 },
  plantName: { fontSize: FontSize.base, fontWeight: '700' },
  plantSpecies: { fontSize: FontSize.xs, fontWeight: '500' },

  // Progress bar
  progressSection: { gap: 4 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelSmall: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Revive
  reviveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reviveText: { fontSize: FontSize.xs, fontWeight: '700' },

  // Add card
  addCard: {
    width: CARD_WIDTH,
    minHeight: 220,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 14,
  },
  addIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTitle: { fontSize: FontSize.sm, fontWeight: '700' },
  addSub: { fontSize: FontSize.xs },
});
