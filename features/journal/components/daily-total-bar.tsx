/**
 * Floating total bar — shows daily calorie progress at bottom of Journal.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Shadows } from '@/constants/theme';

type Props = {
  totalCalories: number;
  calorieGoal: number;
  onAdd?: () => void;
};

export function DailyTotalBar({ totalCalories, calorieGoal, onAdd }: Props) {
  const progress = Math.min(totalCalories / calorieGoal, 1);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, Shadows.soft]}>
        <View style={styles.top}>
          <View>
            <Text style={styles.label}>Daily Nourishment</Text>
            <Text style={styles.value}>
              {totalCalories.toLocaleString()}{' '}
              <Text style={styles.goal}>/ {calorieGoal.toLocaleString()} kcal</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <MaterialIcons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    zIndex: 30,
  },
  bar: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, fontWeight: '500' },
  value: { color: '#FFF', fontSize: FontSize.xl, fontWeight: '700', marginTop: 2 },
  goal: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm, fontWeight: '400' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
});
