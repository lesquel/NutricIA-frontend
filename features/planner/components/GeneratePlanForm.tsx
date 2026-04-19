/**
 * GeneratePlanForm — form to generate a new meal plan.
 * Reads defaults from current user (calorie_goal, dietary_preferences).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useGeneratePlan } from '../hooks/use-generate-plan';
import type { DietaryConstraints } from '@/shared/types/api';

export interface GeneratePlanFormProps {
  onSuccess?: () => void;
}

export function GeneratePlanForm({ onSuccess }: GeneratePlanFormProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const user = useAuthStore((s) => s.user);
  const generatePlan = useGeneratePlan();

  const [calories, setCalories] = useState(String(user?.calorie_goal ?? 2000));
  const [protein, setProtein] = useState('150');
  const [carbs, setCarbs] = useState('200');
  const [fat, setFat] = useState('70');

  const userPrefs = user?.dietary_preferences ?? [];
  const [constraints, setConstraints] = useState<DietaryConstraints>({
    vegetarian: userPrefs.includes('vegetarian'),
    vegan: userPrefs.includes('vegan'),
    gluten_free: userPrefs.includes('gluten_free'),
    allergies: [],
  });
  const [allergyInput, setAllergyInput] = useState('');

  function toggleConstraint(key: keyof Omit<DietaryConstraints, 'allergies'>) {
    setConstraints((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function addAllergy() {
    const trimmed = allergyInput.trim();
    if (trimmed && !constraints.allergies.includes(trimmed)) {
      setConstraints((prev) => ({ ...prev, allergies: [...prev.allergies, trimmed] }));
      setAllergyInput('');
    }
  }

  function removeAllergy(allergy: string) {
    setConstraints((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
  }

  function handleSubmit() {
    const targetCalories = parseInt(calories, 10);
    if (isNaN(targetCalories) || targetCalories < 500) return;

    generatePlan.mutate(
      {
        target_calories: targetCalories,
        target_macros: {
          protein_g: parseFloat(protein) || 0,
          carbs_g: parseFloat(carbs) || 0,
          fat_g: parseFloat(fat) || 0,
        },
        constraints,
      },
      { onSuccess },
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('planner.form.targetCalories')}</Text>
        <Input
          label={t('planner.form.dailyCalories')}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
          placeholder="2000"
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('planner.form.targetMacros')}</Text>
        <View style={styles.macroRow}>
          <View style={styles.macroInput}>
            <Input
              label={t('planner.form.proteinLabel')}
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              placeholder="150"
            />
          </View>
          <View style={styles.macroInput}>
            <Input
              label={t('planner.form.carbsLabel')}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              placeholder="200"
            />
          </View>
          <View style={styles.macroInput}>
            <Input
              label={t('planner.form.fatLabel')}
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              placeholder="70"
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('planner.form.dietaryRestrictions')}</Text>
        <View style={[styles.toggleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(
            [
              { key: 'vegetarian', labelKey: 'planner.form.vegetarian' },
              { key: 'vegan', labelKey: 'planner.form.vegan' },
              { key: 'gluten_free', labelKey: 'planner.form.glutenFree' },
            ] as const
          ).map(({ key, labelKey }) => (
            <View key={key} style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>{t(labelKey)}</Text>
              <Switch
                value={constraints[key]}
                onValueChange={() => toggleConstraint(key)}
                trackColor={{ true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('planner.form.allergies')}</Text>
        <View style={styles.allergyInputRow}>
          <View style={styles.allergyInputFlex}>
            <Input
              placeholder={t('planner.form.allergiesPlaceholder')}
              value={allergyInput}
              onChangeText={setAllergyInput}
              onSubmitEditing={addAllergy}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={addAllergy}
          >
            <MaterialIcons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        {constraints.allergies.length > 0 && (
          <View style={styles.allergyChips}>
            {constraints.allergies.map((allergy) => (
              <TouchableOpacity
                key={allergy}
                style={[styles.allergyChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => removeAllergy(allergy)}
              >
                <Text style={[styles.allergyChipText, { color: colors.text }]}>{allergy}</Text>
                <MaterialIcons name="close" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Button
          variant="primary"
          size="lg"
          style={styles.submitBtn}
          onPress={handleSubmit}
          loading={generatePlan.isPending}
        >
          {t('planner.form.submit')}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.sm,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  macroInput: {
    flex: 1,
  },
  toggleCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  toggleLabel: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  allergyInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-end',
  },
  allergyInputFlex: {
    flex: 1,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allergyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  allergyChipText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: Spacing['3xl'],
    marginBottom: Spacing['2xl'],
  },
});
