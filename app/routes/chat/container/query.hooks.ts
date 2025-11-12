import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ChatService } from "~/services/api/chat";

export function useChatEntry(
  roomToken: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["chat-entry", roomToken],
    queryFn: async () => await ChatService.entry(roomToken),
    enabled: options?.enabled !== false && !!roomToken,
    staleTime: 0, // Always fresh on mount
    retry: false, // Don't retry on error (invalid token, etc.)
  });
}

export function useChatMessages({
  sessionId,
  page = 1,
  pageSize = 50,
  enabled = true,
}: {
  sessionId: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["chat-messages", sessionId, page, pageSize],
    queryFn: async () =>
      await ChatService.getMessages(sessionId, page, pageSize),
    enabled: enabled && !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5000, // Poll every 5 seconds (fallback if SignalR fails)
  });
}

export function useChatSession(
  sessionId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["chat-session", sessionId],
    queryFn: async () => await ChatService.getSession(sessionId),
    enabled: options?.enabled !== false && !!sessionId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useStaffInbox({
  pageSize = 20,
  page = 1,
}: {
  pageSize?: number;
  page?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["staff-inbox", pageSize],
    queryFn: async ({ pageParam = 1 }) =>
      await ChatService.getStaffInbox({
        page: pageParam as number,
        pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const currentPage = lastPageParam as number;
      const hasMore = lastPage.items.length === pageSize;
      return hasMore ? currentPage + 1 : undefined;
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      const currentPage = firstPageParam as number;
      return currentPage > 1 ? currentPage - 1 : undefined;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10000, // Poll every 10 seconds
  });
}
