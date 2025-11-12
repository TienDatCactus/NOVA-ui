import http from "~/lib/http";
import { Chat } from "~/services/url";

async function entry(roomToken: string) {
  try {
    const resp = await http.get(Chat.entry, { params: { roomToken } });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getSession(sessionId: string) {
  try {
    const resp = await http.get(Chat.session(sessionId));
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getMessages(sessionId: string, page = 1, pageSize = 50) {
  try {
    const resp = await http.get(Chat.messages(sessionId), {
      params: { page, pageSize },
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function sendMessage(data: {
  sessionId: string;
  message: string;
  sender: string; // "Guest" | "Staff"
}) {
  try {
    const resp = await http.post(Chat.sendMessage, data);
    return resp.data;
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
}) {
  try {
    const resp = await http.get(Chat.staffInbox, {
      params: { page, pageSize },
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function assignStaff(sessionId: string, staffUserId: string) {
  try {
    const resp = await http.post(Chat.assign(sessionId), { staffUserId });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function closeSession(sessionId: string) {
  try {
    const resp = await http.post(Chat.close(sessionId));
    return resp.data;
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
