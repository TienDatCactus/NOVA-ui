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
    refetchInterval: 30 * 1000, // Poll every 30s for new sessions
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

// Query: Get staff list for assignment
export function useStaffList() {
  return useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const { StaffService } = await import("~/services/api/staff");
      return await StaffService.getStaffList();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
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
