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

import { Colors, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResetPassword } from '@/features/auth/hooks/use-reset-password';
import { useToast } from '@/shared/hooks/use-toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export default function ResetPasswordScreen() {
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
      next.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      next.password = 'Mínimo 8 caracteres';
    }
    if (password !== confirmPassword) {
      next.confirm = 'Las contraseñas no coinciden';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (!token) {
      toast.error('Token inválido o expirado. Solicitá un nuevo link.');
      return;
    }

    resetPassword.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => {
          toast.success('Contraseña restablecida. Podés iniciar sesión.');
          router.replace('/login');
        },
        onError: (err: unknown) => {
          const detail =
            (err as { body?: { detail?: string } })?.body?.detail ??
            'Token inválido o expirado. Solicitá un nuevo link.';
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
            Ir al login
          </Button>

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
              <MaterialIcons name="lock" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Nueva contraseña</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Elegí una contraseña segura de al menos 8 caracteres.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, ...Shadows.soft }]}>
            <Input
              label="NUEVA CONTRASEÑA"
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              error={errors.password}
              secureTextEntry
              prefix={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
            />

            <Input
              label="CONFIRMAR CONTRASEÑA"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
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
              Restablecer contraseña
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
