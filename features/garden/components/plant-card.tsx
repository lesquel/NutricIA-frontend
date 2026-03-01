/**
 * PlantCard — individual habit plant in the garden grid.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Shadows, BorderRadius } from '@/constants/theme';
import type { HabitResponse } from '@/shared/types/api';

type PlantEmoji = Record<string, string>;
const PLANT_EMOJIS: PlantEmoji = {
  fern: '🌿',
  palm: '🌱',
  mint: '🥀',
  cactus: '🌵',
  default: '🌱',
};

type Props = {
  habit: HabitResponse;
  colors: (typeof Colors)['light'];
  colorScheme: 'light' | 'dark';
  onCheckIn?: () => void;
};

export function PlantCard({ habit, colors, colorScheme, onCheckIn }: Props) {
  const streak = habit.streak ?? habit.streak_days ?? 0;
  const progress = Math.round(habit.progress ?? habit.progress_percentage ?? 0);
  const checkedToday = Boolean(habit.is_checked_today ?? habit.checked_today);
  const isWilted = habit.plant_state === 'wilted';
  const emoji = PLANT_EMOJIS[habit.plant_type] ?? PLANT_EMOJIS.default;

  return (
    <View
      style={[
        styles.card,
        Shadows.soft,
        {
          backgroundColor: colors.surface,
          borderColor: isWilted ? colors.warning : colors.border,
          borderWidth: isWilted ? 2 : 1,
        },
      ]}
    >
      {/* Badge */}
      {habit.plant_state === 'healthy' && (
        <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
          <MaterialIcons name="local-fire-department" size={14} color={colors.accent} />
          <Text style={[styles.badgeText, { color: colors.accent }]}>{streak} Days</Text>
        </View>
      )}
      {habit.plant_state === 'growing' && (
        <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
          <MaterialIcons name="eco" size={14} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>{streak} Days</Text>
        </View>
      )}
      {isWilted && (
        <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}>
          <MaterialIcons name="warning" size={14} color={colors.error} />
          <Text style={[styles.badgeText, { color: colors.error }]}>Dry</Text>
        </View>
      )}

      {/* Emoji */}
      <View style={[styles.emojiContainer, isWilted && { opacity: 0.6 }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {habit.name}
        </Text>
        {isWilted ? (
          <Text style={[styles.species, { color: colors.error }]}>Needs Water</Text>
        ) : (
          <Text style={[styles.species, { color: colors.textMuted }]}>{habit.plant_type}</Text>
        )}
      </View>

      {/* Progress / Revive */}
      {isWilted ? (
        <TouchableOpacity
          style={[styles.reviveBtn, { backgroundColor: `${colors.waterBlue}15` }]}
          activeOpacity={0.7}
          onPress={onCheckIn}
        >
          <MaterialIcons name="water-drop" size={14} color={colors.waterBlue} />
          <Text style={[styles.reviveText, { color: colors.waterBlue }]}>Revive</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              Lvl {habit.level}
            </Text>
            <Text style={[styles.progressLabel, { color: checkedToday ? colors.primary : colors.textMuted }]}> 
              {checkedToday ? '✓ Done' : `${progress}%`}
            </Text>
          </View>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: colorScheme === 'dark' ? colors.border : '#ECECEC' },
            ]}
          >
            <View
              style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  emojiContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  emoji: { fontSize: 56 },
  info: { gap: 2, marginBottom: 10 },
  name: { fontSize: FontSize.base, fontWeight: '700' },
  species: { fontSize: FontSize.xs, fontWeight: '500' },
  progressSection: { gap: 4 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  reviveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reviveText: { fontSize: FontSize.xs, fontWeight: '700' },
});
