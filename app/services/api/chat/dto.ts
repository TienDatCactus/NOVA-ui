import type { z } from "zod";
import { ChatSchema } from "~/services/api/chat/chat.schema";

const {
  ChatEntryResponseSchema,
  ChatSessionDetailSchema,
  ChatSessionMessagesSchema,
  ChatSendHttpMessageRequestSchema,
  ChatSendHttpMessageResponseSchema,
  StaffChatInboxResponseSchema,
} = ChatSchema;

// Response DTOs
export type ChatEntryResponseDto = z.infer<typeof ChatEntryResponseSchema>;
export type ChatSessionDetailDto = z.infer<typeof ChatSessionDetailSchema>;
export type ChatSessionMessagesDto = z.infer<typeof ChatSessionMessagesSchema>;
export type ChatSendHttpMessageResponseDto = z.infer<
  typeof ChatSendHttpMessageResponseSchema
>;
export type StaffChatInboxResponseDto = z.infer<
  typeof StaffChatInboxResponseSchema
>;

// Request DTOs
export type ChatSendHttpMessageRequestDto = z.infer<
  typeof ChatSendHttpMessageRequestSchema
>;
