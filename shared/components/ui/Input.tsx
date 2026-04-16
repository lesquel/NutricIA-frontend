import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, FontSize } from '@/constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  secureTextEntry?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  prefix,
  suffix,
  secureTextEntry,
  ...rest
}: InputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [secure, setSecure] = useState(secureTextEntry ?? false);

  const borderColor = error ? colors.error : colors.border;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.background,
            borderColor,
          },
        ]}
      >
        {prefix && <View style={styles.prefixSlot}>{prefix}</View>}

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry ? secure : false}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setSecure((s) => !s)} style={styles.suffixSlot}>
            <MaterialIcons
              name={secure ? 'visibility-off' : 'visibility'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {suffix && !secureTextEntry && (
          <View style={styles.suffixSlot}>{suffix}</View>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      {helperText && !error && (
        <Text style={[styles.helperText, { color: colors.textMuted }]}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  prefixSlot: { justifyContent: 'center' },
  suffixSlot: { justifyContent: 'center' },
  errorText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  helperText: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
