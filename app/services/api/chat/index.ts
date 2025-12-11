import http from "~/lib/http";
import { Chat } from "~/services/url";
import { ChatSchema } from "~/services/api/chat/chat.schema";
import type {
  ChatEntryResponseDto,
  ChatSessionDetailDto,
  ChatSessionMessagesDto,
  ChatSendHttpMessageRequestDto,
  ChatSendHttpMessageResponseDto,
  StaffChatInboxResponseDto,
} from "./dto";
import type { ChatMessagesParams } from "./chat.types";
import axios from "axios";

const {
  ChatEntryResponseSchema,
  ChatSessionDetailSchema,
  ChatSessionMessagesSchema,
  ChatSendHttpMessageRequestSchema,
  ChatSendHttpMessageResponseSchema,
  StaffChatInboxResponseSchema,
} = ChatSchema;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

/**
 * Check if customer can chat and get session info
 * @param bookingRoomId - The booking room ID to check chat availability
 */
async function getChatEntry(roomToken: string): Promise<ChatEntryResponseDto> {
  try {
    const resp = await axios.get(Chat.entry(roomToken));
    return ChatEntryResponseSchema.parse(resp.data.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Get chat session details
 * @param sessionId - The chat session ID
 */
async function getChatSession(
  sessionId: string
): Promise<ChatSessionDetailDto> {
  try {
    const resp = await axios.get(Chat.session(sessionId));
    return ChatSessionDetailSchema.parse(resp.data.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Get all messages in a chat session
 * @param sessionId - The chat session ID
 */
async function getChatSessionMessages(
  sessionId: string,
  params?: ChatMessagesParams
): Promise<ChatSessionMessagesDto> {
  try {
    const resp = await axios.get(Chat.messages(sessionId), { params });
    return ChatSessionMessagesSchema.parse(resp.data.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Send a message in a chat session (HTTP fallback)
 * @param data - Message data including sessionId, message, sender, staffUserId
 */
async function sendChatMessageHttp(
  data: ChatSendHttpMessageRequestDto
): Promise<ChatSendHttpMessageResponseDto> {
  try {
    const validatedData = ChatSendHttpMessageRequestSchema.parse(data);
    const resp = await axios.post(Chat.sendMessage, validatedData);
    return ChatSendHttpMessageResponseSchema.parse(resp.data.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Get staff chat inbox with all active sessions
 */
async function getStaffChatInbox(
  params?: ChatMessagesParams
): Promise<StaffChatInboxResponseDto> {
  try {
    const resp = await http.get(Chat.staffInbox, { params });
    return StaffChatInboxResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Assign a chat session to a staff member
 * @param sessionId - The chat session ID
 * @param staffUserId - The staff user ID to assign to
 */
async function assignChatSession(
  sessionId: string,
  staffUserId: string
): Promise<void> {
  try {
    const resp = await http.post(Chat.assign(sessionId), { staffUserId });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Close a chat session
 * @param sessionId - The chat session ID to close
 */
async function closeChatSession(sessionId: string): Promise<void> {
  try {
    await axios.post(Chat.close(sessionId));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function markRead(messageId: string) {
  try {
    const resp = await http.post(Chat.markRead(messageId));
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
async function markAllRead(sessionId: string) {
  try {
    const resp = await http.post(Chat.markAllRead(sessionId));
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const ChatService = {
  getChatEntry,
  getChatSession,
  getChatSessionMessages,
  sendChatMessageHttp,
  getStaffChatInbox,
  assignChatSession,
  closeChatSession,
  markRead,
  markAllRead,
};
