import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, FontSize, Shadows, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DIET_TAGS = [
  'Vegan',
  'Keto',
  'Paleo',
  'Gluten-Free',
  'Low Sugar',
  'Pescatarian',
  'Vegetarian',
  'Mediterranean',
];

const SETTINGS_ITEMS: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
}[] = [
  { icon: 'notifications-none', label: 'Notifications', value: 'On' },
  { icon: 'palette', label: 'Theme', value: 'System' },
  { icon: 'security', label: 'Privacy & Data' },
  { icon: 'help-outline', label: 'Help & Support' },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [calorieGoal, setCalorieGoal] = useState(2100);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [activeTags, setActiveTags] = useState<string[]>(['Vegan', 'Low Sugar']);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings & Goals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatar, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
              <Text style={styles.avatarInitials}>JD</Text>
            </View>
            <View style={[styles.editBadge, { backgroundColor: colors.surface, borderColor: colors.white }]}>
              <MaterialIcons name="edit" size={16} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>Jane Doe</Text>
          <Text style={[styles.profileRole, { color: colors.primary }]}>Mindful Eater</Text>
          <TouchableOpacity
            style={[styles.editProfileBtn, { borderColor: `${colors.accent}50` }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.editProfileText, { color: colors.accent }]}>EDIT PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* Goals Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardTitleRow}>
            <MaterialIcons name="bolt" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Targets</Text>
          </View>

          {/* Energy Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderLabel}>
              <Text style={[styles.sliderLabelText, { color: colors.textMuted }]}>
                ENERGY GOAL
              </Text>
              <Text style={[styles.sliderValue, { color: colors.text }]}>
                {calorieGoal.toLocaleString()}{' '}
                <Text style={[styles.sliderUnit, { color: colors.textMuted }]}>kcal</Text>
              </Text>
            </View>
            <View style={styles.sliderTrackOuter}>
              <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${((calorieGoal - 1200) / (3500 - 1200)) * 100}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <View style={styles.sliderBtnRow}>
                <TouchableOpacity
                  onPress={() => setCalorieGoal(Math.max(1200, calorieGoal - 100))}
                  style={[styles.sliderBtn, { backgroundColor: colors.background }]}
                >
                  <MaterialIcons name="remove" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCalorieGoal(Math.min(3500, calorieGoal + 100))}
                  style={[styles.sliderBtn, { backgroundColor: colors.background }]}
                >
                  <MaterialIcons name="add" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.sliderHint, { color: colors.textMuted }]}>
              Recommended for maintaining current weight based on your activity level.
            </Text>
          </View>

          {/* Water Slider */}
          <View style={[styles.sliderSection, { marginTop: 24 }]}>
            <View style={styles.sliderLabel}>
              <Text style={[styles.sliderLabelText, { color: colors.textMuted }]}>
                HYDRATION
              </Text>
              <Text style={[styles.sliderValue, { color: colors.text }]}>
                {waterGoal.toLocaleString()}{' '}
                <Text style={[styles.sliderUnit, { color: colors.textMuted }]}>ml</Text>
              </Text>
            </View>
            <View style={styles.sliderTrackOuter}>
              <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${((waterGoal - 1000) / (4000 - 1000)) * 100}%`,
                      backgroundColor: '#5d9a7a',
                    },
                  ]}
                />
              </View>
              <View style={styles.sliderBtnRow}>
                <TouchableOpacity
                  onPress={() => setWaterGoal(Math.max(1000, waterGoal - 250))}
                  style={[styles.sliderBtn, { backgroundColor: colors.background }]}
                >
                  <MaterialIcons name="remove" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setWaterGoal(Math.min(4000, waterGoal + 250))}
                  style={[styles.sliderBtn, { backgroundColor: colors.background }]}
                >
                  <MaterialIcons name="add" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Dietary Preferences */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardTitleRow}>
            <MaterialIcons name="restaurant-menu" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Dietary Preferences</Text>
          </View>
          <Text style={[styles.dietHint, { color: colors.textMuted }]}>
            Select tags to customize AI food recognition suggestions.
          </Text>
          <View style={styles.tagsWrap}>
            {DIET_TAGS.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tag,
                    active
                      ? { backgroundColor: colors.primary }
                      : { borderColor: `${colors.textMuted}50`, borderWidth: 1, backgroundColor: 'transparent' },
                  ]}
                  activeOpacity={0.7}
                >
                  {active && <MaterialIcons name="check" size={14} color="#FFF" />}
                  <Text
                    style={[
                      styles.tagText,
                      { color: active ? '#FFF' : colors.textMuted },
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* System Settings */}
        <View style={[styles.settingsList, { backgroundColor: colors.surface }]}>
          {SETTINGS_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.settingsRow,
                index < SETTINGS_ITEMS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
              activeOpacity={0.6}
            >
              <View style={styles.settingsRowLeft}>
                <View style={[styles.settingsIconCircle, { backgroundColor: `${colors.primary}18` }]}>
                  <MaterialIcons name={item.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>{item.label}</Text>
              </View>
              <View style={styles.settingsRowRight}>
                {item.value && (
                  <Text style={[styles.settingsValue, { color: colors.textMuted }]}>
                    {item.value}
                  </Text>
                )}
                <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Version */}
        <Text style={[styles.version, { color: colors.textMuted }]}>NutricIA v0.1.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8 },

  // Profile
  profileSection: { alignItems: 'center', paddingVertical: 16, gap: 4 },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: FontSize['3xl'], fontWeight: '700', color: '#FFF' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: FontSize.xl, fontWeight: '700' },
  profileRole: { fontSize: FontSize.base, fontWeight: '600' },
  editProfileBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  editProfileText: { fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.8 },

  // Card
  card: {
    borderRadius: BorderRadius['2xl'],
    padding: 24,
    marginTop: 20,
    ...Shadows.soft,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700' },

  // Slider
  sliderSection: { gap: 8 },
  sliderLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sliderLabelText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sliderValue: { fontSize: FontSize.xl, fontWeight: '700' },
  sliderUnit: { fontSize: FontSize.sm, fontWeight: '400' },
  sliderTrackOuter: { gap: 10 },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  sliderBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderHint: { fontSize: FontSize.xs, lineHeight: 16 },

  // Diet tags
  dietHint: { fontSize: FontSize.sm, marginBottom: 12 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tagText: { fontSize: FontSize.sm, fontWeight: '600' },

  // Settings list
  settingsList: {
    borderRadius: BorderRadius.xl,
    marginTop: 20,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  settingsRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: { fontSize: FontSize.base, fontWeight: '600' },
  settingsRowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingsValue: { fontSize: FontSize.sm },
  version: { textAlign: 'center', fontSize: FontSize.xs, marginTop: 20 },
});
