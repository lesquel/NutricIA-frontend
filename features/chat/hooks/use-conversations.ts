import { useQuery } from '@tanstack/react-query';
import { chatService } from '../api/chat.service';

/**
 * TanStack Query wrapper for GET /chat/conversations.
 */
export function useConversations(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['conversations', limit, offset],
    queryFn: () => chatService.listConversations(limit, offset),
  });
}
