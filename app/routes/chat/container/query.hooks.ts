import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "~/services/api/chat";
import type { ChatMessagesParams } from "~/services/api/chat/chat.types";
import type { ChatSendHttpMessageRequestDto } from "~/services/api/chat/dto";

export function useChatEntry(roomToken: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["chat-entry", roomToken],
    queryFn: async () => await ChatService.getChatEntry(roomToken),
    enabled: enabled && !!roomToken,
    staleTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useChatSession(sessionId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["chat-session", sessionId],
    queryFn: async () => await ChatService.getChatSession(sessionId),
    enabled: enabled && !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Query: Get chat messages with manual pagination
export function useChatMessages(
  sessionId: string,
  enabled: boolean = true,
  params?: ChatMessagesParams
) {
  return useQuery({
    queryKey: ["chat-messages", sessionId, params],
    queryFn: async () =>
      await ChatService.getChatSessionMessages(sessionId, params),
    enabled: enabled && !!sessionId,
    staleTime: 0,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Query: Get staff inbox with manual pagination
export function useStaffInbox(params?: ChatMessagesParams) {
  return useQuery({
    queryKey: ["staff-chat-inbox", params],
    queryFn: async () => await ChatService.getStaffChatInbox(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

// Mutation: Send message (HTTP fallback)
export function useSendMessageHttp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChatSendHttpMessageRequestDto) =>
      ChatService.sendChatMessageHttp(data),
    onSuccess: (data, variables) => {
      // Invalidate messages to refetch
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.sessionId],
      });
    },
  });
}

// Mutation: Assign staff to session
export function useAssignStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      staffUserId,
    }: {
      sessionId: string;
      staffUserId: string;
    }) => ChatService.assignChatSession(sessionId, staffUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-chat-inbox"] });
    },
  });
}

// Mutation: Close session
export function useCloseSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => ChatService.closeChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-chat-inbox"] });
    },
  });
}

// Mutation: Mark message as read
export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => ChatService.markRead(messageId),
    onMutate: async (messageId) => {
      // Optimistically update message as read
      const queryKeys = queryClient.getQueriesData({
        queryKey: ["chat-messages"],
      });

      queryKeys.forEach(([key, data]) => {
        if (data && Array.isArray(data)) {
          const updatedMessages = data.map((msg: any) =>
            msg.id === messageId
              ? { ...msg, isRead: true, readAt: new Date().toISOString() }
              : msg
          );
          queryClient.setQueryData(key, updatedMessages);
        }
      });
    },
    onError: (error, messageId) => {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    },
  });
}

// Mutation: Mark all messages in session as read
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => ChatService.markAllRead(sessionId),
    onMutate: async (sessionId) => {
      // Optimistically mark all messages in session as read
      const queryKey = ["chat-messages", sessionId];
      const previousData = queryClient.getQueryData(queryKey);

      if (previousData && Array.isArray(previousData)) {
        const updatedMessages = previousData.map((msg: any) => ({
          ...msg,
          isRead: true,
          readAt: new Date().toISOString(),
        }));
        queryClient.setQueryData(queryKey, updatedMessages);
      }

      return { previousData };
    },
    onError: (error, sessionId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["chat-messages", sessionId],
          context.previousData
        );
      }
    },
    onSuccess: (data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
    },
  });
}
