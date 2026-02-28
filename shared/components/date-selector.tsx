/**
 * Shared DateSelector component.
 * Uses the global date store so all screens stay in sync.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { Colors, FontSize } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDateStore } from '@/shared/store/date.store';

export function DateSelector() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const selectedDate = useDateStore((s) => s.selectedDate);
  const setSelectedDate = useDateStore((s) => s.setSelectedDate);

  const days = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = -2; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      result.push({
        key: i.toString(),
        offset: i,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        isToday: i === 0,
        fullDate: d,
      });
    }
    return result;
  }, []);

  const selectedDay = selectedDate.getDate();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {days.map((item) => {
          const isSelected = item.date === selectedDay;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setSelectedDate(item.fullDate)}
              style={[
                styles.pill,
                isSelected && { backgroundColor: colors.primary, transform: [{ scale: 1.05 }] },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayLabel,
                  { color: isSelected ? '#FFF' : colors.textMuted },
                  isSelected && { opacity: 0.9 },
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateLabel,
                  { color: isSelected ? '#FFF' : colors.textMuted },
                  isSelected && { fontWeight: '700' },
                ]}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 20, paddingLeft: 24 },
  scroll: { gap: 12, paddingRight: 24, paddingBottom: 4 },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    height: 72,
    borderRadius: 16,
  },
  dayLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateLabel: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    marginTop: 4,
  },
});
