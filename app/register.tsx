import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Colors, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { useToast } from '@/shared/hooks/use-toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const toast = useToast();
  const register = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = (): boolean => {
    const next: Record<string, string | undefined> = {};
    if (!name.trim()) next.name = t('errors.nameRequired');
    if (!email.trim()) next.email = t('errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = t('errors.emailInvalid');
    if (!password) next.password = t('errors.passwordRequired');
    else if (password.length < 8) next.password = t('errors.passwordMin');
    if (password !== confirmPassword) next.confirm = t('errors.passwordMismatch');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;

    register.mutate(
      { email: email.trim().toLowerCase(), password, name: name.trim() },
      {
        onSuccess: () => {
          router.replace('/(tabs)');
        },
        onError: (err: unknown) => {
          const detail =
            (err as { body?: { detail?: string } })?.body?.detail ??
            t('errors.registerFailed');
          toast.error(detail);
        },
      },
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backBtn, { backgroundColor: colors.surface }]}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={[styles.logoCircle, { backgroundColor: `${colors.primary}18` }]}>
              <MaterialIcons name="spa" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{t('auth.register.title')}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t('auth.register.subtitle')}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, ...Shadows.soft }]}>
            {/* Name */}
            <Input
              label={t('auth.register.nameLabel')}
              placeholder={t('auth.register.namePlaceholder')}
              value={name}
              onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: undefined })); }}
              error={errors.name}
              autoCapitalize="words"
              prefix={<MaterialIcons name="person-outline" size={20} color={colors.textMuted} />}
            />

            {/* Email */}
            <Input
              label={t('auth.register.emailLabel')}
              placeholder={t('auth.register.emailPlaceholder')}
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              prefix={<MaterialIcons name="mail-outline" size={20} color={colors.textMuted} />}
            />

            {/* Password */}
            <Input
              label={t('auth.register.passwordLabel')}
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
              error={errors.password}
              secureTextEntry
              prefix={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
            />

            {/* Confirm Password */}
            <Input
              label={t('auth.register.confirmLabel')}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirm: undefined })); }}
              error={errors.confirm}
              secureTextEntry
              prefix={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
            />

            {/* Password hint */}
            <View style={styles.hintRow}>
              <MaterialIcons
                name={password.length >= 8 ? 'check-circle' : 'radio-button-unchecked'}
                size={16}
                color={password.length >= 8 ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.hintText,
                  { color: password.length >= 8 ? colors.primary : colors.textMuted },
                ]}
              >
                {t('auth.register.passwordHint')}
              </Text>
            </View>

            {/* Register Button */}
            <Button
              variant="primary"
              size="lg"
              loading={register.isPending}
              onPress={handleRegister}
              style={styles.submitBtn}
            >
              {t('auth.register.submit')}
            </Button>
          </View>

          {/* Already have account */}
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={styles.loginLink}
          >
            <Text style={[styles.loginText, { color: colors.textMuted }]}>
              {t('auth.register.haveAccount')}{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('auth.register.signIn')}</Text>
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={[styles.terms, { color: colors.textMuted }]}>
            {t('auth.register.terms')}{' '}
            <Text style={{ fontWeight: '600' }}>{t('auth.register.termsOfService')}</Text> {t('auth.register.and')}{' '}
            <Text style={{ fontWeight: '600' }}>{t('auth.register.privacyPolicy')}</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: FontSize['2xl'], fontWeight: '800' },
  subtitle: { fontSize: FontSize.sm, fontWeight: '500' },

  // Form Card
  formCard: {
    borderRadius: BorderRadius['2xl'],
    padding: 24,
    gap: 14,
  },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -4,
  },
  hintText: { fontSize: FontSize.xs, fontWeight: '500' },

  submitBtn: { marginTop: 4 },

  loginLink: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 4,
  },
  loginText: { fontSize: FontSize.base, fontWeight: '500' },

  terms: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginTop: 16,
    paddingHorizontal: 16,
  },
});
