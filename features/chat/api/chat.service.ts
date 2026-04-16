/**
 * Chat API service.
 *
 * streamMessage() returns the path + body needed by useSSEStream.
 * listConversations() and getMessages() are plain async functions for TanStack Query.
 */

import { apiClient } from '@/shared/api/client';
import type {
  ChatMessage,
  ConversationSummary,
} from '@/shared/types/api';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export const chatService = {
  /**
   * Returns the SSE endpoint path and body — caller feeds these into useSSEStream.
   */
  streamMessageConfig(
    content: string,
    conversationId?: string,
  ): { path: string; body: Record<string, unknown> } {
    return {
      path: '/chat/message',
      body: conversationId
        ? { content, conversation_id: conversationId }
        : { content },
    };
  },

  listConversations(
    limit = 20,
    offset = 0,
  ): Promise<PaginatedResponse<ConversationSummary>> {
    return apiClient.get<PaginatedResponse<ConversationSummary>>(
      `/chat/conversations?limit=${limit}&offset=${offset}`,
    );
  },

  getMessages(
    conversationId: string,
    limit = 50,
    offset = 0,
  ): Promise<PaginatedResponse<ChatMessage>> {
    return apiClient.get<PaginatedResponse<ChatMessage>>(
      `/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
    );
  },
};
