import z from "zod";

const ChatEntryResponseSchema = z.object({
  canChat: z.boolean(),
  message: z.string().nullable(),
  sessionId: z.string(),
  roomName: z.string(),
  customerName: z.string(),
  checkinDate: z.string().optional(),
  checkoutDate: z.string(),
});

const ChatSessionDetailSchema = z.object({
  id: z.string(),
  bookingRoomId: z.string(),
  state: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  assignedStaffUserId: z.string().nullable(),
  assignedStaffName: z.string().nullable(),
  lastMessageAt: z.string().nullable(),
  lastMessagePreview: z.string().nullable(),
  roomName: z.string(),
  customerName: z.string(),
  customerEmail: z.email().optional().nullable(),
  customerPhone: z.string(),
  checkinDate: z.string(),
  checkoutDate: z.string(),
});

const ChatSessionMessageItemSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  sender: z.enum(["Guest", "Staff", "System"]),
  message: z.string(),
  staffUserId: z.string().nullable(),
  staffName: z.string().nullable(),
  createdAt: z.string(),
  detectedLanguage: z.string().optional(),
});

const ChatSessionMessagesSchema = z.array(ChatSessionMessageItemSchema);

const ChatSendHttpMessageRequestSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1, "Message cannot be empty"),
  sender: z.enum(["Guest", "Staff", "System"]),
  staffUserId: z.string().optional(),
});

const ChatSendHttpMessageResponseSchema = ChatSessionMessageItemSchema;

const StaffChatInboxItemSchema = z.object({
  id: z.string(),
  state: z.string(),
  roomName: z.string(),
  customerName: z.string(),
  lastMessageAt: z.string().nullable(),
  lastMessagePreview: z.string().nullable(),
  assignedStaffName: z.string().nullable(),
});

const StaffChatInboxResponseSchema = z.array(StaffChatInboxItemSchema);

export const ChatSchema = {
  ChatEntryResponseSchema,
  ChatSessionDetailSchema,
  ChatSessionMessagesSchema,
  ChatSendHttpMessageRequestSchema,
  ChatSendHttpMessageResponseSchema,
  StaffChatInboxResponseSchema,
  StaffChatInboxItemSchema,
};
