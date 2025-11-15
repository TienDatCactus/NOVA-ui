import { z } from "zod";

// Enums
const ChatSenderSchema = z.enum(["Guest", "Staff", "System"]);
const ChatSessionStatusSchema = z.enum(["Open", "Closed", "Expired"]);
const ChatEntryFailureReasonSchema = z.enum([
  "NO_ACTIVE_STAY",
  "CHAT_SESSION_EXPIRED",
  "INVALID_TOKEN",
  "INVALID_ROOM_TOKEN",
]);

// Chat Entry Response (Success)
const ChatEntrySuccessResponseSchema = z.object({
  canChat: z.literal(true),
  sessionId: z.string().uuid(),
  roomName: z.string(),
  customerName: z.string(),
  checkinDate: z.string(),
  checkoutDate: z.string(),
});

// Chat Entry Response (Failure)
const ChatEntryFailureResponseSchema = z.object({
  canChat: z.literal(false),
  reason: ChatEntryFailureReasonSchema,
  message: z.string(),
  roomName: z.string().optional(),
});

// Union type for Chat Entry Response
const ChatEntryResponseSchema = z.discriminatedUnion("canChat", [
  ChatEntrySuccessResponseSchema,
  ChatEntryFailureResponseSchema,
]);

// Chat Message
const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  sender: ChatSenderSchema,
  message: z.string(),
  createdAt: z.string(),
});

// Chat Messages Response (paginated)
const ChatMessagesResponseSchema = z.object({
  items: z.array(ChatMessageSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

// Chat Session
const ChatSessionSchema = z.object({
  id: z.string().uuid(),
  roomName: z.string(),
  customerName: z.string(),
  status: ChatSessionStatusSchema,
  assignedStaffId: z.string().uuid().optional(),
  assignedStaffName: z.string().optional(),
  createdAt: z.string(),
  lastMessageAt: z.string().optional(),
});

// Send Message Request
const SendMessageRequestSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1, "Tin nhắn không được để trống"),
  sender: ChatSenderSchema,
  staffUserId: z.string().uuid().optional(), // Required when sender = "Staff"
});

// Send Message Response
const SendMessageResponseSchema = ChatMessageSchema;

// Staff Inbox Item
const StaffInboxItemSchema = z.object({
  sessionId: z.string().uuid(),
  roomName: z.string(),
  customerName: z.string(),
  lastMessage: z.string(),
  lastMessageAt: z.string(),
  unreadCount: z.number(),
  assignedStaffId: z.string().uuid().optional(),
  assignedStaffName: z.string().optional(),
  status: ChatSessionStatusSchema,
});

// Staff Inbox Response (paginated)
const StaffInboxResponseSchema = z.object({
  items: z.array(StaffInboxItemSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

// Assign Staff Request
const AssignStaffRequestSchema = z.object({
  staffUserId: z.string().uuid(),
});

// Assign Staff Response
const AssignStaffResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Close Session Response
const CloseSessionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// SignalR Message Event (ReceiveMessage)
const SignalRMessageEventSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  sender: ChatSenderSchema,
  message: z.string(),
  createdAt: z.string(),
});

// SignalR Typing Event (UserTyping)
const SignalRTypingEventSchema = z.object({
  sessionId: z.string().uuid(),
  sender: ChatSenderSchema,
});

// Export all schemas as a factory
export const ChatSchema = {
  ChatSenderSchema,
  ChatSessionStatusSchema,
  ChatEntryFailureReasonSchema,
  ChatEntrySuccessResponseSchema,
  ChatEntryFailureResponseSchema,
  ChatEntryResponseSchema,
  ChatMessageSchema,
  ChatMessagesResponseSchema,
  ChatSessionSchema,
  SendMessageRequestSchema,
  SendMessageResponseSchema,
  StaffInboxItemSchema,
  StaffInboxResponseSchema,
  AssignStaffRequestSchema,
  AssignStaffResponseSchema,
  CloseSessionResponseSchema,
  SignalRMessageEventSchema,
  SignalRTypingEventSchema,
};
