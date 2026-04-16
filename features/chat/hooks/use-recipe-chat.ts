/**
 * useRecipeChat — wraps useSSEStream with chat-domain logic.
 *
 * Manages local message list state:
 *   - Appends user message immediately on send
 *   - Streams tokens into a mutable assistant message
 *   - Attaches recipe_card events to assistant message metadata
 *   - Finalises message on done + invalidates ['conversations'] query
 *   - Exposes conversationId for the current thread
 */

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSSEStream } from '@/shared/hooks/use-sse-stream';
import { chatService } from '../api/chat.service';
import type { ChatMessageRole, ChatSSEEvent, RecipeCard } from '@/shared/types/api';

export interface LocalMessage {
  /** Temporary client-side ID (prefixed `local-`) or server message_id */
  id: string;
  role: ChatMessageRole;
  content: string;
  /** Recipe cards attached to an assistant message */
  recipes?: RecipeCard[];
}

export interface UseRecipeChatResult {
  messages: LocalMessage[];
  sendMessage: (content: string) => void;
  status: 'idle' | 'streaming' | 'done' | 'error';
  conversationId: string | null;
  /** Reset conversation — clears messages and conversationId */
  reset: () => void;
}

let _localIdCounter = 0;
function localId(): string {
  _localIdCounter += 1;
  return `local-${_localIdCounter}`;
}

export function useRecipeChat(): UseRecipeChatResult {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const sse = useSSEStream<ChatSSEEvent>();

  // Ref to track the current assistant message id while streaming
  const assistantMsgIdRef = useRef<string | null>(null);

  // Process incoming SSE events
  useEffect(() => {
    const latestEvent = sse.events[sse.events.length - 1];
    if (!latestEvent) return;

    switch (latestEvent.type) {
      case 'token': {
        const token = latestEvent.content;
        const assistantId = assistantMsgIdRef.current;
        if (!assistantId) {
          // First token — create assistant message
          const newId = localId();
          assistantMsgIdRef.current = newId;
          setMessages((prev) => [
            ...prev,
            { id: newId, role: 'assistant', content: token },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + token }
                : m,
            ),
          );
        }
        break;
      }

      case 'recipe_card': {
        const recipe = latestEvent.data;
        const assistantId = assistantMsgIdRef.current;
        if (assistantId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, recipes: [...(m.recipes ?? []), recipe] }
                : m,
            ),
          );
        }
        break;
      }

      case 'done': {
        const { conversation_id, message_id } = latestEvent;
        // Update conversationId from server
        setConversationId(conversation_id);
        // Replace local assistant message id with server id
        const assistantId = assistantMsgIdRef.current;
        if (assistantId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, id: message_id } : m,
            ),
          );
          assistantMsgIdRef.current = null;
        }
        // Invalidate conversations list
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        break;
      }

      case 'error': {
        // Error message will be surfaced via sse.status === 'error'
        break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sse.events.length]);

  function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;

    // Append user message immediately
    const userMsgId = localId();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: trimmed },
    ]);

    assistantMsgIdRef.current = null;

    const { path, body } = chatService.streamMessageConfig(
      trimmed,
      conversationId ?? undefined,
    );
    sse.start(path, body);
  }

  function reset() {
    sse.stop();
    setMessages([]);
    setConversationId(null);
    assistantMsgIdRef.current = null;
  }

  return {
    messages,
    sendMessage,
    status: sse.status,
    conversationId,
    reset,
  };
}
