/**
 * MessageBubble — renders a single chat message.
 *
 * - User: aligned right, primary color background, white text
 * - Assistant: aligned left, surface background, dark text
 * - Renders any attached RecipeCards inline below the text content
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { RecipeCard } from './RecipeCard';
import type { ChatMessageRole, RecipeCard as RecipeCardType } from '@/shared/types/api';

export interface MessageBubbleProps {
  role: ChatMessageRole;
  content: string;
  recipes?: RecipeCardType[];
}

export function MessageBubble({ role, content, recipes }: MessageBubbleProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const isUser = role === 'user';

  const bubbleStyle = isUser
    ? [styles.bubble, styles.bubbleUser, { backgroundColor: colors.primary }]
    : [styles.bubble, styles.bubbleAssistant, { backgroundColor: colors.surface, borderColor: colors.border }];

  const textStyle = isUser
    ? [styles.text, { color: '#FFFFFF' }]
    : [styles.text, { color: colors.text }];

  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      <View style={styles.column}>
        <View style={bubbleStyle}>
          <Text style={textStyle}>{content}</Text>
        </View>

        {recipes && recipes.length > 0 && (
          <View style={styles.recipesContainer}>
            {recipes.map((recipe, i) => (
              <RecipeCard key={i} recipe={recipe} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  column: {
    maxWidth: '85%',
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius['2xl'],
  },
  bubbleUser: {
    borderBottomRightRadius: BorderRadius.sm,
  },
  bubbleAssistant: {
    borderWidth: 1,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  text: {
    fontSize: FontSize.base,
    lineHeight: 22,
  },
  recipesContainer: {
    marginTop: Spacing.xs,
    width: '100%',
  },
});
