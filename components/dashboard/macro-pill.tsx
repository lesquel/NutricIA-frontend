import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontSize, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MacroPillProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
};

export function MacroPill({ icon, label, value }: MacroPillProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border + '80',
          ...Shadows.sm,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.white }]}>
        <MaterialIcons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
    borderRadius: 24,
    borderWidth: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
