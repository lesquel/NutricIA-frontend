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
import { useRouter } from 'expo-router';

import { Colors, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password';
import { useToast } from '@/shared/hooks/use-toast';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const toast = useToast();
  const forgotPassword = useForgotPassword();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError('El email es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Ingresá un email válido');
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    forgotPassword.mutate(email.trim().toLowerCase(), {
      onSuccess: () => {
        toast.success('Si el email está registrado, recibirás un link de restablecimiento');
        router.back();
      },
      onError: () => {
        // Always show generic message to avoid user enumeration
        toast.success('Si el email está registrado, recibirás un link de restablecimiento');
        router.back();
      },
    });
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
            onPress={() => router.back()}
            leftIcon={<MaterialIcons name="arrow-back" size={20} color={colors.primary} />}
            style={styles.backBtn}
          >
            Volver
          </Button>

          {/* Header */}
          <View style={styles.headerSection}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
              <MaterialIcons name="lock-reset" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>¿Olvidaste tu contraseña?</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, ...Shadows.soft }]}>
            <Input
              label="EMAIL"
              placeholder="vos@ejemplo.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError(undefined);
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              prefix={<MaterialIcons name="mail-outline" size={20} color={colors.textMuted} />}
            />

            <Button
              variant="primary"
              size="lg"
              loading={forgotPassword.isPending}
              onPress={handleSubmit}
              style={styles.submitBtn}
            >
              Enviar link
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
