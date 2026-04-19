import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Colors, FontSize, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguageStore } from '@/shared/store/language.store';
import type { SupportedLanguage } from '@/shared/i18n';
import { useUpdateGoals } from '@/features/settings/hooks/use-settings';

const LANGUAGES: { code: SupportedLanguage; labelKey: string; flag: string }[] = [
  { code: 'es', labelKey: 'settings.languageSpanish', flag: '🇪🇸' },
  { code: 'en', labelKey: 'settings.languageEnglish', flag: '🇺🇸' },
];

const DEFAULT_CALORIES = 2100;
const CALORIE_STEP = 100;
const CALORIE_MIN = 1200;
const CALORIE_MAX = 3500;

export default function OnboardingBasicsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const updateGoals = useUpdateGoals();

  const [calorieGoal, setCalorieGoal] = useState(DEFAULT_CALORIES);

  function handleNext() {
    updateGoals.mutate(
      { calorie_goal: calorieGoal },
      {
        onSettled: () => router.push('/onboarding/preferences' as never),
      },
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.step, { color: colors.primary }]}>
          {t('onboarding.stepFormat', { current: 1, total: 2 })}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('onboarding.basics.title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t('onboarding.basics.subtitle')}
        </Text>

        {/* Language */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('onboarding.basics.languageLabel')}
        </Text>
        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => {
            const selected = lang.code === language;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: selected ? colors.primary + '22' : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, { color: colors.text }]}>
                  {t(lang.labelKey)}
                </Text>
                {selected && (
                  <MaterialIcons name="check" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Calorie goal */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('onboarding.basics.calorieLabel')}
        </Text>
        <View
          style={[
            styles.calorieCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => setCalorieGoal((v) => Math.max(CALORIE_MIN, v - CALORIE_STEP))}
            style={[styles.stepBtn, { backgroundColor: colors.background }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="remove" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.calorieCenter}>
            <Text style={[styles.calorieValue, { color: colors.text }]}>{calorieGoal}</Text>
            <Text style={[styles.calorieUnit, { color: colors.textMuted }]}>
              {t('onboarding.basics.calorieUnit')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setCalorieGoal((v) => Math.min(CALORIE_MAX, v + CALORIE_STEP))}
            style={[styles.stepBtn, { backgroundColor: colors.background }]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {t('onboarding.basics.calorieHint')}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          disabled={updateGoals.isPending}
        >
          {updateGoals.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>{t('onboarding.next')}</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 32 },
  step: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FontSize.base,
    marginBottom: 24,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 10,
  },
  langRow: { gap: 10 },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  langFlag: { fontSize: 22 },
  langLabel: { flex: 1, fontSize: FontSize.base, fontWeight: '600' },
  calorieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieCenter: { alignItems: 'center' },
  calorieValue: { fontSize: 36, fontWeight: '800' },
  calorieUnit: { fontSize: FontSize.sm, fontWeight: '500', marginTop: 2 },
  hint: { fontSize: FontSize.xs, marginTop: 8, textAlign: 'center' },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: '700',
  },
});
