import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
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
    staleTime: 0, // 30 seconds
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
    onSuccess: (_, variables) => {
      // Invalidate messages to refetch
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.sessionId],
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Gửi tin nhắn thất bại");
      }
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff-chat-inbox"] });
      queryClient.invalidateQueries({
        queryKey: ["chat-session", variables.sessionId],
      });

      toast.success("Giao phiên chat thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Giao phiên chat thất bại"
        );
      }
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
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
      toast.success("Đánh dấu tất cả tin nhắn là đã đọc thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
            "Đánh dấu tin nhắn là đã đọc thất bại"
        );
      }
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
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
      toast.success("Đánh dấu tất cả tin nhắn là đã đọc thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
            "Đánh dấu tất cả tin nhắn là đã đọc thất bại"
        );
      }
    },
  });
}
