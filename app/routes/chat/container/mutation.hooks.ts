import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "~/services/api/chat";
import type {
  SendMessageRequestDto,
  AssignStaffRequestDto,
} from "~/services/api/chat/dto";
import { toast } from "sonner";

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["send-chat-message"],
    mutationFn: async (data: SendMessageRequestDto) =>
      await ChatService.sendMessage(data),
    onSuccess: (_, variables) => {
      // Invalidate messages list for this session
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.sessionId],
      });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
    },
  });
}

export function useAssignStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["assign-staff-to-chat"],
    mutationFn: async ({
      sessionId,
      staffUserId,
    }: {
      sessionId: string;
      staffUserId: string;
    }) => await ChatService.assignStaff(sessionId, { staffUserId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-session", variables.sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["staff-inbox"] });
      toast.success("Gán nhân viên xử lý thành công.");
    },
    onError: (error) => {
      console.error("Error assigning staff:", error);
      toast.error("Không thể gán nhân viên. Vui lòng thử lại.");
    },
  });
}

export function useCloseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["close-chat-session"],
    mutationFn: async (sessionId: string) =>
      await ChatService.closeSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["staff-inbox"] });
      toast.success("Đóng phiên chat thành công.");
    },
    onError: (error) => {
      console.error("Error closing session:", error);
      toast.error("Không thể đóng phiên chat. Vui lòng thử lại.");
    },
  });
}
