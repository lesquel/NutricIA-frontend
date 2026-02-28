import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/features/auth/store/auth.store';

const { width } = Dimensions.get('window');

type OnboardingSlide = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  features: string[];
};

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'auto-awesome',
    iconColor: '#C67B66',
    title: 'AI-Powered\nFood Scanner',
    subtitle: 'Just point your camera at any meal and our AI instantly analyzes calories, macros and nutrients.',
    features: [
      'Snap a photo — instant nutrition breakdown',
      'Protein, Carbs, Fat & Fiber in seconds',
      'Works with any food, homemade or restaurant',
    ],
  },
  {
    id: '2',
    icon: 'menu-book',
    iconColor: '#5D7A68',
    title: 'Your Daily\nNourishment Journal',
    subtitle: 'Track every meal with beautiful daily timelines. See your breakfast, lunch, snacks & dinner at a glance.',
    features: [
      'Organized by meal type — Breakfast to Dinner',
      'Daily calorie & macro totals updated live',
      'Swipe between days to review past meals',
    ],
  },
  {
    id: '3',
    icon: 'yard',
    iconColor: '#5B8FA8',
    title: 'Grow Your\nHabit Garden',
    subtitle: 'Turn healthy habits into plants! Each habit becomes a virtual plant that grows with your consistency.',
    features: [
      'Plants grow healthier as your streak increases',
      'Neglected habits wilt — revive them with check-ins',
      'Track hydration with the water cup tracker',
    ],
  },
  {
    id: '4',
    icon: 'spa',
    iconColor: '#E8A75A',
    title: 'Mindful Tracking,\nNot Obsessive',
    subtitle: 'NutricIA is designed around nourishment, not restriction. Gentle insights, not guilt trips.',
    features: [
      'Beautiful nourishment ring — not a calorie alarm',
      'Personalized goals that adapt to you',
      'Dark mode, dietary preferences & more',
    ],
  },
];

export default function WelcomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
      router.replace('/login');
    } else {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/login');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width }]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}18` }]}>
        <MaterialIcons name={item.icon} size={64} color={item.iconColor} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>

      {/* Feature list */}
      <View style={styles.featureList}>
        {item.features.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: item.iconColor }]} />
            <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.6}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={32}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Next'}</Text>
          <MaterialIcons name={isLast ? 'arrow-forward' : 'chevron-right'} size={22} color="#FFF" />
        </TouchableOpacity>

        {/* Already have account */}
        {!isLast && (
          <TouchableOpacity onPress={() => { completeOnboarding(); router.replace('/login'); }} style={styles.loginLink}>
            <Text style={[styles.loginLinkText, { color: colors.textMuted }]}>
              Already have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Log In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: { fontSize: FontSize.base, fontWeight: '600' },

  slide: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    paddingTop: 100,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
    lineHeight: 42,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: FontSize.base,
    lineHeight: 22,
    marginBottom: 28,
  },
  featureList: { gap: 14 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  featureText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 18,
    fontWeight: '500',
  },

  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    gap: 20,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 18,
    borderRadius: BorderRadius['2xl'],
  },
  ctaText: {
    color: '#FFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  loginLink: { paddingVertical: 4 },
  loginLinkText: { fontSize: FontSize.sm, fontWeight: '500' },
});
