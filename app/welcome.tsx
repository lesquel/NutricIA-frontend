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
import { useTranslation } from 'react-i18next';

import { Colors, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/features/auth/store/auth.store';

const { width } = Dimensions.get('window');

type OnboardingSlide = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  titleKey: string;
  subtitleKey: string;
  featureKeys: string[];
};

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'auto-awesome',
    iconColor: '#C67B66',
    titleKey: 'welcome.slide1.title',
    subtitleKey: 'welcome.slide1.subtitle',
    featureKeys: [
      'welcome.slide1.feature1',
      'welcome.slide1.feature2',
      'welcome.slide1.feature3',
    ],
  },
  {
    id: '2',
    icon: 'menu-book',
    iconColor: '#5D7A68',
    titleKey: 'welcome.slide2.title',
    subtitleKey: 'welcome.slide2.subtitle',
    featureKeys: [
      'welcome.slide2.feature1',
      'welcome.slide2.feature2',
      'welcome.slide2.feature3',
    ],
  },
  {
    id: '3',
    icon: 'yard',
    iconColor: '#5B8FA8',
    titleKey: 'welcome.slide3.title',
    subtitleKey: 'welcome.slide3.subtitle',
    featureKeys: [
      'welcome.slide3.feature1',
      'welcome.slide3.feature2',
      'welcome.slide3.feature3',
    ],
  },
  {
    id: '4',
    icon: 'spa',
    iconColor: '#E8A75A',
    titleKey: 'welcome.slide4.title',
    subtitleKey: 'welcome.slide4.subtitle',
    featureKeys: [
      'welcome.slide4.feature1',
      'welcome.slide4.feature2',
      'welcome.slide4.feature3',
    ],
  },
];

export default function WelcomeScreen() {
  const { t } = useTranslation();
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
      <Text style={[styles.title, { color: colors.text }]}>{t(item.titleKey)}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t(item.subtitleKey)}</Text>

      {/* Feature list */}
      <View style={styles.featureList}>
        {item.featureKeys.map((featureKey, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: item.iconColor }]} />
            <Text style={[styles.featureText, { color: colors.text }]}>{t(featureKey)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.6}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>{t('welcome.skip')}</Text>
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
          <Text style={styles.ctaText}>{isLast ? t('welcome.getStarted') : t('welcome.next')}</Text>
          <MaterialIcons name={isLast ? 'arrow-forward' : 'chevron-right'} size={22} color="#FFF" />
        </TouchableOpacity>

        {/* Already have account */}
        {!isLast && (
          <TouchableOpacity onPress={() => { completeOnboarding(); router.replace('/login'); }} style={styles.loginLink}>
            <Text style={[styles.loginLinkText, { color: colors.textMuted }]}>
              {t('welcome.haveAccount')}{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('welcome.logIn')}</Text>
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
