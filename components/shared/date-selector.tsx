import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { Colors, FontSize } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function DateSelector() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const days = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = -2; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      result.push({
        key: i.toString(),
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        isToday: i === 0,
      });
    }
    return result;
  }, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {days.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.pill,
              item.isToday && { backgroundColor: colors.primary, transform: [{ scale: 1.05 }] },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayLabel,
                { color: item.isToday ? '#FFF' : colors.textMuted },
                item.isToday && { opacity: 0.9 },
              ]}
            >
              {item.day}
            </Text>
            <Text
              style={[
                styles.dateLabel,
                { color: item.isToday ? '#FFF' : colors.textMuted },
                item.isToday && { fontWeight: '700' },
              ]}
            >
              {item.date}
            </Text>
          </TouchableOpacity>
        ))}
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
    fontSize: FontSize.lg,
    fontWeight: '500',
    marginTop: 4,
  },
});
