import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontSize, Shadows, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TOTAL_CUPS = 8;

type PlantState = 'healthy' | 'growing' | 'wilted';

type Plant = {
  id: string;
  name: string;
  species: string;
  state: PlantState;
  level: number;
  progress: number; // 0-100
  streak: number;
  emoji: string;
};

const MOCK_PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Calorie Balance',
    species: 'Consistency Fern',
    state: 'healthy',
    level: 3,
    progress: 85,
    streak: 5,
    emoji: '🌿',
  },
  {
    id: '2',
    name: 'Protein Goal',
    species: 'Protein Palm',
    state: 'growing',
    level: 1,
    progress: 40,
    streak: 2,
    emoji: '🌱',
  },
  {
    id: '3',
    name: 'No Sugar',
    species: 'Mindful Mint',
    state: 'wilted',
    level: 2,
    progress: 0,
    streak: 0,
    emoji: '🥀',
  },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 24 * 2 - 12) / 2;

export default function GardenScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [cups, setCups] = useState(5);

  const toggleCup = (index: number) => {
    setCups(index + 1 === cups ? index : index + 1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerLabel, { color: colors.primary }]}>Your Growth</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Habit Garden</Text>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <MaterialIcons name="notifications-none" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Water Tracker */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <MaterialIcons name="water-drop" size={22} color={colors.waterBlue} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Hydration</Text>
            </View>
            <Text style={[styles.cupCount, { color: colors.textMuted }]}>
              {cups}/{TOTAL_CUPS} Cups
            </Text>
          </View>

          <View style={styles.cupsRow}>
            {Array.from({ length: TOTAL_CUPS }).map((_, i) => {
              const filled = i < cups;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleCup(i)}
                  style={[
                    styles.cupBtn,
                    {
                      backgroundColor: filled
                        ? `${colors.waterBlue}18`
                        : colorScheme === 'dark'
                          ? colors.border
                          : '#F0F0EC',
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="water-drop"
                    size={20}
                    color={filled ? colors.waterBlue : colors.waterEmpty}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Plants Header */}
        <View style={styles.plantsHeader}>
          <Text style={[styles.plantsTitle, { color: colors.text }]}>Your Plants</Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Plant Grid */}
        <View style={styles.plantsGrid}>
          {MOCK_PLANTS.map((plant) => (
            <PlantCard key={plant.id} plant={plant} colors={colors} colorScheme={colorScheme} />
          ))}
          {/* Add New Habit Card */}
          <TouchableOpacity
            style={[
              styles.addCard,
              { borderColor: colors.border, backgroundColor: colors.background },
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[styles.addIconCircle, { backgroundColor: colors.surface }]}
            >
              <MaterialIcons name="add" size={28} color={colors.textMuted} />
            </View>
            <Text style={[styles.addTitle, { color: colors.textMuted }]}>Plant New Seed</Text>
            <Text style={[styles.addSub, { color: colors.textMuted }]}>Start a new habit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PlantCard({
  plant,
  colors,
  colorScheme,
}: {
  plant: Plant;
  colors: typeof Colors[keyof typeof Colors];
  colorScheme: 'light' | 'dark';
}) {
  const isWilted = plant.state === 'wilted';

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
      {plant.state === 'healthy' && (
        <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
          <MaterialIcons name="local-fire-department" size={14} color={colors.accent} />
          <Text style={[styles.badgeText, { color: colors.accent }]}>{plant.streak} Days</Text>
        </View>
      )}
      {plant.state === 'growing' && (
        <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
          <MaterialIcons name="eco" size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>{plant.streak} Days</Text>
        </View>
      )}
      {plant.state === 'wilted' && (
        <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}>
          <MaterialIcons name="warning" size={14} color={colors.error} />
          <Text style={[styles.badgeText, { color: colors.error }]}>Dry</Text>
        </View>
      )}

      {/* Plant Emoji */}
      <View style={[styles.plantEmojiContainer, isWilted && { opacity: 0.6 }]}>
        <Text style={styles.plantEmoji}>{plant.emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.plantInfo}>
        <Text style={[styles.plantName, { color: colors.text }]} numberOfLines={1}>
          {plant.name}
        </Text>
        {isWilted ? (
          <Text style={[styles.plantSpecies, { color: colors.error }]}>Needs Water</Text>
        ) : (
          <Text style={[styles.plantSpecies, { color: colors.textMuted }]}>
            {plant.species}
          </Text>
        )}
      </View>

      {/* Progress or Revive */}
      {isWilted ? (
        <TouchableOpacity
          style={[styles.reviveBtn, { backgroundColor: `${colors.waterBlue}15` }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="water-drop" size={14} color={colors.waterBlue} />
          <Text style={[styles.reviveText, { color: colors.waterBlue }]}>Revive</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressLabelSmall, { color: colors.textMuted }]}>
              Lvl {plant.level}
            </Text>
            <Text style={[styles.progressLabelSmall, { color: colors.textMuted }]}>
              {plant.progress}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colorScheme === 'dark' ? colors.border : '#ECECEC' }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${plant.progress}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
        </View>
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
  cupCount: { fontSize: FontSize.sm, fontWeight: '500' },
  cupsRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  cupBtn: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 999,
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
