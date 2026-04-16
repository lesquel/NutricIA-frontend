/**
 * Recipes tab — AI-powered recipe chat.
 *
 * Features:
 * - Suggested prompts in empty state
 * - Inverted FlatList for chat-style scroll (newest at bottom)
 * - TypingIndicator while streaming
 * - ChatComposer fixed to bottom with KeyboardAvoidingView
 * - New conversation button in header
 * - Error toast on SSE failure
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSize, Spacing, type ThemeColors } from '@/constants/theme';
import { useToast } from '@/shared/hooks/use-toast';
import { useRecipeChat } from '@/features/chat/hooks/use-recipe-chat';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { ChatComposer } from '@/features/chat/components/ChatComposer';
import { TypingIndicator } from '@/features/chat/components/TypingIndicator';
import type { LocalMessage } from '@/features/chat/hooks/use-recipe-chat';

const SUGGESTED_PROMPTS = [
  '¿Qué puedo cocinar con lo que comí esta semana?',
  'Recomendame algo bajo en carbos para la cena',
  'Dame ideas de almuerzo vegetariano',
  '¿Cómo preparo una merienda alta en proteínas?',
];

function EmptyState({
  onPrompt,
  colors,
}: {
  onPrompt: (text: string) => void;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '18' }]}>
        <MaterialIcons name="restaurant" size={40} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Recetas IA</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
        Contame qué tenés ganas de cocinar y te armo una receta personalizada.
      </Text>

      <View style={styles.promptsContainer}>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.promptChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onPrompt(prompt)}
            activeOpacity={0.75}
          >
            <Text style={[styles.promptText, { color: colors.text }]}>{prompt}</Text>
            <MaterialIcons name="north-east" size={14} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function RecipesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const toast = useToast();

  // Deep-link params from planner "Reemplazar" flow
  // planId + mealId are available for future swap_planned_meal tool integration
  const { prompt } = useLocalSearchParams<{ planId?: string; mealId?: string; prompt?: string }>();

  const { messages, sendMessage, status, reset } = useRecipeChat();

  const flatListRef = useRef<FlatList<LocalMessage>>(null);

  // Show error toast when SSE fails
  useEffect(() => {
    if (status === 'error') {
      toast.error('No se pudo conectar con el asistente. Intentá de nuevo.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const isStreaming = status === 'streaming';
  const hasMessages = messages.length > 0;

  // FlatList with inverted=true renders from bottom to top — newest at bottom.
  // Data must be reversed for inverted list.
  const invertedData = [...messages].reverse();

  function renderItem({ item }: { item: LocalMessage }) {
    return (
      <MessageBubble
        role={item.role}
        content={item.content}
        recipes={item.recipes}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="restaurant" size={22} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Recetas IA</Text>
        </View>
        {hasMessages && (
          <TouchableOpacity
            style={[styles.newChatButton, { borderColor: colors.border }]}
            onPress={reset}
            activeOpacity={0.75}
          >
            <MaterialIcons name="add" size={18} color={colors.primary} />
            <Text style={[styles.newChatLabel, { color: colors.primary }]}>Nueva</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chat area */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {!hasMessages ? (
          <EmptyState onPrompt={sendMessage} colors={colors} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={invertedData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              isStreaming ? (
                <TypingIndicator />
              ) : null
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}

        <ChatComposer onSend={sendMessage} disabled={isStreaming} initialValue={prompt} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  newChatLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    paddingBottom: Spacing['4xl'],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing['2xl'],
  },
  promptsContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  promptText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
});
