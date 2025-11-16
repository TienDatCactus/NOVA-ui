import http from "~/lib/http";
import { Chat } from "~/services/url";
import { ChatSchema } from "~/services/api/chat/chat.schema";
import type {
  ChatEntryResponseDto,
  ChatSessionDto,
  ChatMessagesResponseDto,
  SendMessageRequestDto,
  SendMessageResponseDto,
  StaffInboxResponseDto,
  AssignStaffRequestDto,
  AssignStaffResponseDto,
  CloseSessionResponseDto,
} from "./dto";

const {
  ChatEntryResponseSchema,
  ChatSessionSchema,
  ChatMessagesResponseSchema,
  SendMessageRequestSchema,
  SendMessageResponseSchema,
  StaffInboxResponseSchema,
  AssignStaffRequestSchema,
  AssignStaffResponseSchema,
  CloseSessionResponseSchema,
} = ChatSchema;

async function entry(roomToken: string): Promise<ChatEntryResponseDto> {
  try {
    const resp = await http.get(Chat.entry, { params: { roomToken } });
    return ChatEntryResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getSession(sessionId: string): Promise<ChatSessionDto> {
  try {
    const resp = await http.get(Chat.session(sessionId));
    return ChatSessionSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getMessages(
  sessionId: string,
  page = 1,
  pageSize = 50
): Promise<ChatMessagesResponseDto> {
  try {
    const resp = await http.get(Chat.messages(sessionId), {
      params: { page, pageSize },
    });
    return ChatMessagesResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function sendMessage(
  data: SendMessageRequestDto
): Promise<SendMessageResponseDto> {
  try {
    const validatedData = SendMessageRequestSchema.parse(data);
    const resp = await http.post(Chat.sendMessage, validatedData);
    return SendMessageResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getStaffInbox({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
}): Promise<StaffInboxResponseDto> {
  try {
    const resp = await http.get(Chat.staffInbox, {
      params: { page, pageSize },
    });
    return StaffInboxResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function assignStaff(
  sessionId: string,
  data: AssignStaffRequestDto
): Promise<AssignStaffResponseDto> {
  try {
    const validatedData = AssignStaffRequestSchema.parse(data);
    const resp = await http.post(Chat.assign(sessionId), validatedData);
    return AssignStaffResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function closeSession(
  sessionId: string
): Promise<CloseSessionResponseDto> {
  try {
    const resp = await http.post(Chat.close(sessionId));
    return CloseSessionResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const ChatService = {
  entry,
  getSession,
  getMessages,
  sendMessage,
  getStaffInbox,
  assignStaff,
  closeSession,
};
