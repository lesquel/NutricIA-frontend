/**
 * WaterTracker — hydration cup row for the Garden screen.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TOTAL_CUPS = 8;

type Props = {
  cups: number;
  onToggleCup: (index: number) => void;
};

export function WaterTracker({ cups, onToggleCup }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialIcons name="water-drop" size={22} color={colors.waterBlue} />
          <Text style={[styles.title, { color: colors.text }]}>Hydration</Text>
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
              onPress={() => onToggleCup(i)}
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
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: FontSize.lg, fontWeight: '700' },
  cupCount: { fontSize: FontSize.sm, fontWeight: '500' },
  cupsRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  cupBtn: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
