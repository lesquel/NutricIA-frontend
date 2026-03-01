/**
 * Shared MealCard component.
 * Accepts either a MealResponse (from API) or a simple legacy shape.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontSize, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { MealResponse } from '@/shared/types/api';

type LegacyMeal = {
  id: string;
  name: string;
  mealType: string;
  time: string;
  calories: number;
  tag?: string;
};

type MealCardProps = {
  meal: MealResponse | LegacyMeal;
  onPress?: () => void;
};

function isApiMeal(meal: MealResponse | LegacyMeal): meal is MealResponse {
  return 'meal_type' in meal && 'name' in meal;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function isDisplayableImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.startsWith('blob:') || lower.startsWith('data:')) return false;
  return true;
}

export function MealCard({ meal, onPress }: MealCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const name = isApiMeal(meal) ? meal.name : meal.name;
  const mealType = isApiMeal(meal) ? capitalize(meal.meal_type) : meal.mealType;
  const time = isApiMeal(meal) ? formatTime(meal.logged_at) : meal.time;
  const { calories } = meal;
  const tag = isApiMeal(meal) ? meal.tags?.[0] : meal.tag;
  const imageUrl = isApiMeal(meal) && isDisplayableImageUrl(meal.image_url) ? meal.image_url : null;
  const confidencePct = isApiMeal(meal) ? Math.round((meal.confidence_score ?? 0) * 100) : null;
  const macroPct = isApiMeal(meal)
    ? (() => {
        const total = meal.protein_g + meal.carbs_g + meal.fat_g;
        if (total <= 0) {
          return { protein: 0, carbs: 0, fat: 0 };
        }
        return {
          protein: Math.round((meal.protein_g / total) * 100),
          carbs: Math.round((meal.carbs_g / total) * 100),
          fat: Math.round((meal.fat_g / total) * 100),
        };
      })()
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          ...Shadows.sm,
        },
      ]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} />
      ) : (
        <View style={[styles.thumbnail, { backgroundColor: colors.surface }]}> 
          <MaterialIcons name="restaurant" size={24} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {mealType} • {time}
        </Text>
        {tag && (
          <View style={[styles.tagBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
          </View>
        )}
        {isApiMeal(meal) && macroPct && (
          <Text style={[styles.macroText, { color: colors.textMuted }]}> 
            P {meal.protein_g}g ({macroPct.protein}%) • C {meal.carbs_g}g ({macroPct.carbs}%) • F {meal.fat_g}g ({macroPct.fat}%)
          </Text>
        )}
        {isApiMeal(meal) && confidencePct !== null && (
          <Text style={[styles.confidenceText, { color: colors.primary }]}>IA {confidencePct}%</Text>
        )}
      </View>

      <View style={styles.calorieBox}>
        <Text style={[styles.calorieValue, { color: colors.text }]}>{calories}</Text>
        <Text style={[styles.calorieUnit, { color: colors.textMuted }]}>kcal</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: FontSize.base, fontWeight: '600' },
  meta: { fontSize: FontSize.xs },
  macroText: { fontSize: 11, marginTop: 3 },
  confidenceText: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  tagText: { fontSize: 10, fontWeight: '700' },
  calorieBox: { alignItems: 'flex-end' },
  calorieValue: { fontSize: FontSize.lg, fontWeight: '700' },
  calorieUnit: { fontSize: FontSize.xs },
});
