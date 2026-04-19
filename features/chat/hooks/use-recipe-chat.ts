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
  /** Load an existing conversation by id (replaces current messages). */
  loadConversation: (id: string) => Promise<void>;
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
  // Index of the next unprocessed event. When events arrive batched (common
  // on native XHR onprogress), we must drain all of them in order — processing
  // only `events[last]` drops every intermediate token and scrambles the
  // rendered reply.
  const processedUpToRef = useRef(0);

  // Process incoming SSE events in order, draining any that have accumulated
  // since the last render.
  useEffect(() => {
    if (sse.events.length <= processedUpToRef.current) return;

    const pending = sse.events.slice(processedUpToRef.current);
    processedUpToRef.current = sse.events.length;

    // Collect token appends into a single string so we can apply one state
    // update per render instead of one per event — keeps content in order
    // and avoids N sequential setState calls for a long burst.
    let pendingTokens = '';
    const applyPendingTokens = () => {
      if (!pendingTokens) return;
      const tokens = pendingTokens;
      pendingTokens = '';
      const assistantId = assistantMsgIdRef.current;
      if (!assistantId) {
        const newId = localId();
        assistantMsgIdRef.current = newId;
        setMessages((prev) => [
          ...prev,
          { id: newId, role: 'assistant', content: tokens },
        ]);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + tokens } : m,
          ),
        );
      }
    };

    for (const event of pending) {
      switch (event.type) {
        case 'token': {
          pendingTokens += event.content;
          break;
        }

        case 'recipe_card': {
          applyPendingTokens();
          const recipe = event.data;
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
          applyPendingTokens();
          const { conversation_id, message_id } = event;
          setConversationId(conversation_id);
          const assistantId = assistantMsgIdRef.current;
          if (assistantId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, id: message_id } : m,
              ),
            );
            assistantMsgIdRef.current = null;
          }
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });
          break;
        }

        case 'error': {
          // Surfaced via sse.status === 'error'
          break;
        }
      }
    }

    applyPendingTokens();
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
    processedUpToRef.current = 0;

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
    processedUpToRef.current = 0;
  }

  async function loadConversation(id: string) {
    sse.stop();
    assistantMsgIdRef.current = null;
    processedUpToRef.current = 0;
    setConversationId(id);
    try {
      // Fetch the full history — high limit because we show everything.
      const res = await chatService.getMessages(id, 500, 0);
      // Server returns newest-first or oldest-first depending on impl; sort
      // defensively by created_at ascending so the chat reads top-to-bottom.
      const sorted = [...res.items].sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      );
      setMessages(
        sorted.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          recipes: (m.metadata?.recipes as RecipeCard[] | undefined) ?? undefined,
        })),
      );
    } catch {
      // Leave the conversation selected but empty — user can send a message
      // to fall back on the server for retrieval.
      setMessages([]);
    }
  }

  return {
    messages,
    sendMessage,
    status: sse.status,
    conversationId,
    reset,
    loadConversation,
  };
}
