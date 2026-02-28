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
import { useRegister } from '@/features/auth/hooks/use-auth';

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const register = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = (): boolean => {
    const next: Record<string, string | undefined> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Minimum 8 characters';
    if (password !== confirmPassword) next.confirm = 'Passwords do not match';
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
        onError: (err: any) => {
          const detail = err?.body?.detail ?? 'Registration failed. Try again.';
          Alert.alert('Error', detail);
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
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Start your mindful nourishment journey
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, ...Shadows.soft }]}>
            {/* Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>FULL NAME</Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: colors.background, borderColor: errors.name ? colors.error : colors.border },
                ]}
              >
                <MaterialIcons name="person-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Jane Doe"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  value={name}
                  onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: undefined })); }}
                />
              </View>
              {errors.name && <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>}
            </View>

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

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>CONFIRM PASSWORD</Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: colors.background, borderColor: errors.confirm ? colors.error : colors.border },
                ]}
              >
                <MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirm: undefined })); }}
                />
              </View>
              {errors.confirm && <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirm}</Text>}
            </View>

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
                At least 8 characters
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary },
                register.isPending && { opacity: 0.7 },
              ]}
              onPress={handleRegister}
              disabled={register.isPending}
              activeOpacity={0.8}
            >
              {register.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Already have account */}
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={styles.loginLink}
          >
            <Text style={[styles.loginText, { color: colors.textMuted }]}>
              Already have an account?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Log In</Text>
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={[styles.terms, { color: colors.textMuted }]}>
            By creating an account you agree to our{' '}
            <Text style={{ fontWeight: '600' }}>Terms of Service</Text> and{' '}
            <Text style={{ fontWeight: '600' }}>Privacy Policy</Text>
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

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -4,
  },
  hintText: { fontSize: FontSize.xs, fontWeight: '500' },

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
