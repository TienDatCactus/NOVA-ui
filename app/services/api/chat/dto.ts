import type { z } from "zod";
import { ChatSchema } from "~/services/api/chat/chat.schema";

// Extract types from schemas
export type ChatSender = z.infer<typeof ChatSchema.ChatSenderSchema>;
export type ChatSessionStatus = z.infer<
  typeof ChatSchema.ChatSessionStatusSchema
>;
export type ChatEntryFailureReason = z.infer<
  typeof ChatSchema.ChatEntryFailureReasonSchema
>;

export type ChatEntrySuccessResponseDto = z.infer<
  typeof ChatSchema.ChatEntrySuccessResponseSchema
>;
export type ChatEntryFailureResponseDto = z.infer<
  typeof ChatSchema.ChatEntryFailureResponseSchema
>;
export type ChatEntryResponseDto = z.infer<
  typeof ChatSchema.ChatEntryResponseSchema
>;

export type ChatMessageDto = z.infer<typeof ChatSchema.ChatMessageSchema>;
export type ChatMessagesResponseDto = z.infer<
  typeof ChatSchema.ChatMessagesResponseSchema
>;

export type ChatSessionDto = z.infer<typeof ChatSchema.ChatSessionSchema>;

export type SendMessageRequestDto = z.infer<
  typeof ChatSchema.SendMessageRequestSchema
>;
export type SendMessageResponseDto = z.infer<
  typeof ChatSchema.SendMessageResponseSchema
>;

export type StaffInboxItemDto = z.infer<typeof ChatSchema.StaffInboxItemSchema>;
export type StaffInboxResponseDto = z.infer<
  typeof ChatSchema.StaffInboxResponseSchema
>;

export type AssignStaffRequestDto = z.infer<
  typeof ChatSchema.AssignStaffRequestSchema
>;
export type AssignStaffResponseDto = z.infer<
  typeof ChatSchema.AssignStaffResponseSchema
>;

export type CloseSessionResponseDto = z.infer<
  typeof ChatSchema.CloseSessionResponseSchema
>;

export type SignalRMessageEventDto = z.infer<
  typeof ChatSchema.SignalRMessageEventSchema
>;
export type SignalRTypingEventDto = z.infer<
  typeof ChatSchema.SignalRTypingEventSchema
>;
