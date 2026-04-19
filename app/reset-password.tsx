import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Colors, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResetPassword } from '@/features/auth/hooks/use-reset-password';
import { useToast } from '@/shared/hooks/use-toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const toast = useToast();
  const resetPassword = useResetPassword();

  // Token comes from deep-link URL params: /reset-password?token=xxx
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!password) {
      next.password = t('errors.passwordRequired');
    } else if (password.length < 8) {
      next.password = t('errors.passwordMin');
    }
    if (password !== confirmPassword) {
      next.confirm = t('errors.passwordMismatch');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (!token) {
      toast.error(t('errors.tokenInvalid'));
      return;
    }

    resetPassword.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => {
          toast.success(t('auth.reset.success'));
          router.replace('/login');
        },
        onError: (err: unknown) => {
          const detail =
            (err as { body?: { detail?: string } })?.body?.detail ??
            t('errors.tokenInvalid');
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
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.replace('/login')}
            leftIcon={<MaterialIcons name="arrow-back" size={20} color={colors.primary} />}
            style={styles.backBtn}
          >
            {t('auth.reset.back')}
          </Button>

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
              <MaterialIcons name="lock" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{t('auth.reset.title')}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t('auth.reset.subtitle')}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, ...Shadows.soft }]}>
            <Input
              label={t('auth.reset.passwordLabel')}
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              error={errors.password}
              secureTextEntry
              prefix={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
            />

            <Input
              label={t('auth.reset.confirmLabel')}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
              }}
              error={errors.confirm}
              secureTextEntry
              prefix={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
            />

            <Button
              variant="primary"
              size="lg"
              loading={resetPassword.isPending}
              onPress={handleSubmit}
              style={styles.submitBtn}
            >
              {t('auth.reset.submit')}
            </Button>
          </View>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
    paddingTop: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  formCard: {
    borderRadius: BorderRadius['2xl'],
    padding: 24,
    gap: 20,
  },
  submitBtn: {
    marginTop: 4,
  },
});
