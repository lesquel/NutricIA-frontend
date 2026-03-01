import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEmailLogin } from '@/features/auth/hooks/use-auth';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const emailLogin = useEmailLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Min 8 characters';
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
        onError: (err: any) => {
          const detail = err?.body?.detail ?? 'Invalid email or password.';
          Alert.alert('Login Failed', detail);
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
              Mindful nourishment, powered by AI
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, ...Shadows.soft }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
              Sign in to continue your journey
            </Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>EMAIL</Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: colors.background, borderColor: errors.email ? colors.error : colors.border },
                ]}
              >
                <MaterialIcons name="mail-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                />
              </View>
              {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>PASSWORD</Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: colors.background, borderColor: errors.password ? colors.error : colors.border },
                ]}
              >
                <MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary },
                emailLogin.isPending && { opacity: 0.7 },
              ]}
              onPress={handleLogin}
              disabled={emailLogin.isPending}
              activeOpacity={0.8}
            >
              {emailLogin.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* OAuth Buttons */}
            <View style={styles.oauthRow}>
              <TouchableOpacity
                style={[styles.oauthBtn, { borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <MaterialIcons name="g-mobiledata" size={28} color={colors.text} />
                <Text style={[styles.oauthText, { color: colors.text }]}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.oauthBtn, { borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <MaterialIcons name="apple" size={24} color={colors.text} />
                <Text style={[styles.oauthText, { color: colors.text }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register link */}
          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={styles.registerLink}
          >
            <Text style={[styles.registerText, { color: colors.textMuted }]}>
              Don&apos;t have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Create One</Text>
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

  fieldGroup: { gap: 6 },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  errorText: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 2 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: FontSize.sm, fontWeight: '600' },

  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: BorderRadius.lg,
    marginTop: 4,
  },
  submitText: {
    color: '#FFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },

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
