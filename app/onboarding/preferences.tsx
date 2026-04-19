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
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useUpdateDietaryPreferences } from '@/features/settings/hooks/use-settings';

/** Minimal starter set — the full catalog (8+) lives in Settings. */
const STARTER_DIET_TAGS: { id: string; i18nKey: string; icon: string }[] = [
  { id: 'Vegan', i18nKey: 'diet.vegan', icon: '🌱' },
  { id: 'Vegetarian', i18nKey: 'diet.vegetarian', icon: '🥗' },
  { id: 'Gluten-Free', i18nKey: 'diet.glutenFree', icon: '🌾' },
  { id: 'Low Sugar', i18nKey: 'diet.lowSugar', icon: '🍬' },
];

export default function OnboardingPreferencesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const completeProfileConfig = useAuthStore((s) => s.completeProfileConfig);
  const updateDietaryPrefs = useUpdateDietaryPreferences();

  const [tags, setTags] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<boolean>(true);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function finish() {
    updateDietaryPrefs.mutate(tags, {
      onSettled: () => {
        // Notifications preference is only local for now — persisted as a
        // future follow-up (not in scope for this minimal onboarding).
        completeProfileConfig();
        router.replace('/(tabs)');
      },
    });
  }

  function skip() {
    completeProfileConfig();
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.step, { color: colors.primary }]}>
          {t('onboarding.stepFormat', { current: 2, total: 2 })}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('onboarding.preferences.title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t('onboarding.preferences.subtitle')}
        </Text>

        {/* Diet tags */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('onboarding.preferences.dietLabel')}
        </Text>
        <View style={styles.tagGrid}>
          {STARTER_DIET_TAGS.map((tag) => {
            const selected = tags.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                onPress={() => toggleTag(tag.id)}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: selected ? colors.primary + '22' : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.tagIcon}>{tag.icon}</Text>
                <Text style={[styles.tagLabel, { color: colors.text }]}>
                  {t(tag.i18nKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('onboarding.preferences.notificationsLabel')}
        </Text>
        <TouchableOpacity
          onPress={() => setNotifications((v) => !v)}
          style={[
            styles.notifCard,
            {
              backgroundColor: colors.surface,
              borderColor: notifications ? colors.primary : colors.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={notifications ? 'notifications-active' : 'notifications-off'}
            size={22}
            color={notifications ? colors.primary : colors.textMuted}
          />
          <View style={styles.notifText}>
            <Text style={[styles.notifTitle, { color: colors.text }]}>
              {t('onboarding.preferences.notificationsTitle')}
            </Text>
            <Text style={[styles.notifHint, { color: colors.textMuted }]}>
              {t('onboarding.preferences.notificationsHint')}
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              {
                backgroundColor: notifications ? colors.primary : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                { alignSelf: notifications ? 'flex-end' : 'flex-start' },
              ]}
            />
          </View>
        </TouchableOpacity>

        <Text style={[styles.footnote, { color: colors.textMuted }]}>
          {t('onboarding.preferences.footnote')}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity onPress={skip} style={styles.skipBtn} activeOpacity={0.7}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>
            {t('onboarding.skipForNow')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={finish}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          disabled={updateDietaryPrefs.isPending}
        >
          {updateDietaryPrefs.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>{t('onboarding.finish')}</Text>
              <MaterialIcons name="check" size={20} color="#FFFFFF" />
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
    marginBottom: 16,
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
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tagIcon: { fontSize: 18 },
  tagLabel: { fontSize: FontSize.sm, fontWeight: '600' },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  notifText: { flex: 1 },
  notifTitle: { fontSize: FontSize.base, fontWeight: '700' },
  notifHint: { fontSize: FontSize.xs, marginTop: 2 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  footnote: {
    fontSize: FontSize.xs,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 24,
    borderTopWidth: 1,
  },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  skipText: { fontSize: FontSize.sm, fontWeight: '600' },
  primaryBtn: {
    flex: 1,
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
