import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Colors, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEmailLogin } from '@/features/auth/hooks/use-auth';
import { useGoogleAuth } from '@/features/auth/hooks/use-google-auth';
import { useAppleAuth } from '@/features/auth/hooks/use-apple-auth';
import { useToast } from '@/shared/hooks/use-toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export default function LoginScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const toast = useToast();
  const emailLogin = useEmailLogin();
  const { loginWithGoogle, isPending: googlePending } = useGoogleAuth();
  const { loginWithApple, isPending: applePending } = useAppleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = t('errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = t('errors.emailInvalid');
    if (!password) next.password = t('errors.passwordRequired');
    else if (password.length < 8) next.password = t('errors.passwordMin');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;

    emailLogin.mutate(
      { email: email.trim().toLowerCase(), password },
      {
        onSuccess: () => {
          router.replace('/(tabs)');
        },
        onError: (err: unknown) => {
          const detail =
            (err as { body?: { detail?: string } })?.body?.detail ??
            t('errors.loginFailed');
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
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={[styles.logoCircle, { backgroundColor: `${colors.primary}18` }]}>
              <MaterialIcons name="spa" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>NutricIA</Text>
            <Text style={[styles.tagline, { color: colors.textMuted }]}>
              {t('auth.tagline')}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, ...Shadows.soft }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>{t('auth.login.title')}</Text>
            <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
              {t('auth.login.subtitle')}
            </Text>

            {/* Email */}
            <Input
              label={t('auth.login.emailLabel')}
              placeholder={t('auth.login.emailPlaceholder')}
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
              label={t('auth.login.passwordLabel')}
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
              error={errors.password}
              secureTextEntry
              prefix={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>
                {t('auth.login.forgot')}
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              variant="primary"
              size="lg"
              loading={emailLogin.isPending}
              onPress={handleLogin}
              style={styles.submitBtn}
            >
              {t('auth.login.submit')}
            </Button>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>{t('auth.login.or')}</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* OAuth Buttons */}
            <View style={styles.oauthRow}>
              <TouchableOpacity
                style={[styles.oauthBtn, { borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={loginWithGoogle}
                disabled={googlePending}
              >
                {googlePending ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <>
                    <MaterialIcons name="g-mobiledata" size={28} color={colors.text} />
                    <Text style={[styles.oauthText, { color: colors.text }]}>Google</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.oauthBtn, { borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={loginWithApple}
                disabled={applePending}
              >
                {applePending ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <>
                    <MaterialIcons name="apple" size={24} color={colors.text} />
                    <Text style={[styles.oauthText, { color: colors.text }]}>Apple</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Register link */}
          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={styles.registerLink}
          >
            <Text style={[styles.registerText, { color: colors.textMuted }]}>
              {t('auth.login.noAccount')}{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('auth.login.createAccount')}</Text>
            </Text>
          </TouchableOpacity>
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
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appName: { fontSize: FontSize['3xl'], fontWeight: '800', letterSpacing: 0.5 },
  tagline: { fontSize: FontSize.sm, fontWeight: '500' },

  // Form Card
  formCard: {
    borderRadius: BorderRadius['2xl'],
    padding: 24,
    gap: 16,
  },
  formTitle: { fontSize: FontSize['2xl'], fontWeight: '700' },
  formSubtitle: { fontSize: FontSize.sm, marginTop: -8 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: FontSize.sm, fontWeight: '600' },

  submitBtn: { marginTop: 4 },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: FontSize.sm, fontWeight: '500' },

  // OAuth
  oauthRow: { flexDirection: 'row', gap: 12 },
  oauthBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  oauthText: { fontSize: FontSize.base, fontWeight: '600' },

  // Register link
  registerLink: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 4,
  },
  registerText: { fontSize: FontSize.base, fontWeight: '500' },
});
