/**
 * ChatComposer — multi-line input + send button.
 *
 * - Disables send when streaming or input is empty
 * - On web: Enter sends, Shift+Enter inserts newline
 * - On native: send button only (Return adds newline via multiline)
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, FontSize, Spacing } from '@/constants/theme';

export interface ChatComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  /** Pre-fill the composer on first render (deep-link / planner swap). */
  initialValue?: string;
}

export function ChatComposer({ onSend, disabled = false, initialValue }: ChatComposerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [value, setValue] = useState(initialValue ?? '');

  const canSend = !disabled && value.trim().length > 0;

  function handleSend() {
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.navBg, borderTopColor: colors.navBorder },
      ]}
    >
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={setValue}
          placeholder="Preguntame algo..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={2000}
          onKeyPress={
            Platform.OS === 'web'
              ? (e) => {
                  // @ts-expect-error — nativeEvent on web has 'key'
                  if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                    e.preventDefault?.();
                    handleSend();
                  }
                }
              : undefined
          }
          editable={!disabled}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.border },
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.75}
        >
          <MaterialIcons
            name="send"
            size={20}
            color={canSend ? '#FFFFFF' : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['2xl'],
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1.5,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '500',
    maxHeight: 120,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
