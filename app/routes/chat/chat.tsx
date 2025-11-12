import { useState } from "react";
import { toast } from "sonner";
import type { Route } from "./+types/chat";
import ChatHeader from "./components/chat-header";
import ChatInput from "./components/chat-input";
import ChatMessagesArea from "./components/chat-messages-area";
import ChatSidebar from "./components/chat-sidebar";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

// Types
type MessageStatus = "sending" | "sent" | "delivered" | "read";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderName?: string;
  status: MessageStatus;
}

// Mock data
const mockConversations = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    avatar: "",
    lastMessage: "Cảm ơn bạn, tôi sẽ check-in lúc 2pm",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    isOnline: true,
    role: "customer" as const,
  },
  {
    id: "2",
    name: "Trần Thị B",
    avatar: "",
    lastMessage: "Phòng có view biển không ạ?",
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
    isOnline: false,
    role: "customer" as const,
  },
  {
    id: "3",
    name: "Lễ tân - Floor 1",
    avatar: "",
    lastMessage: "Booking của khách đã được xác nhận",
    lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
    unreadCount: 1,
    isOnline: true,
    role: "staff" as const,
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Xin chào, tôi muốn đặt phòng cho 2 người",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isOwn: false,
    senderName: "Nguyễn Văn A",
    status: "read",
  },
  {
    id: "2",
    content:
      "Chào anh, em xin phép được hỗ trợ anh. Anh muốn đặt phòng loại nào ạ?",
    timestamp: new Date(Date.now() - 86000000).toISOString(),
    isOwn: true,
    status: "read",
  },
  {
    id: "3",
    content: "Em muốn phòng có view biển, từ ngày 15/11 đến 17/11",
    timestamp: new Date(Date.now() - 85000000).toISOString(),
    isOwn: false,
    senderName: "Nguyễn Văn A",
    status: "read",
  },
  {
    id: "4",
    content:
      "Dạ, em sẽ kiểm tra phòng trống cho anh ngay ạ. Anh vui lòng đợi em một chút nhé.",
    timestamp: new Date(Date.now() - 84000000).toISOString(),
    isOwn: true,
    status: "read",
  },
  {
    id: "5",
    content:
      "Em có phòng Deluxe Ocean View còn trống cho khung giờ đó ạ. Giá 2,500,000 VNĐ/đêm",
    timestamp: new Date(Date.now() - 83000000).toISOString(),
    isOwn: true,
    status: "read",
  },
  {
    id: "6",
    content: "Được ạ, anh đặt phòng đó nhé",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isOwn: false,
    senderName: "Nguyễn Văn A",
    status: "read",
  },
  {
    id: "7",
    content:
      "Dạ, em đã tạo booking cho anh. Mã booking: BK123456. Anh check-in lúc mấy giờ ạ?",
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    isOwn: true,
    status: "read",
  },
  {
    id: "8",
    content: "Cảm ơn bạn, tôi sẽ check-in lúc 2pm",
    timestamp: new Date().toISOString(),
    isOwn: false,
    senderName: "Nguyễn Văn A",
    status: "delivered",
  },
];

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState("1");
  const [messages, setMessages] = useState(mockMessages);

  const selectedConversation = mockConversations.find(
    (c) => c.id === selectedConversationId
  );

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: "sending",
    };

    setMessages([...messages, newMessage]);
    toast.success("Tin nhắn đã được gửi");

    // Simulate message sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 1000);
  };

  return (
    <div className="flex ">
      <ChatSidebar
        conversations={filteredConversations}
        selectedId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="flex-1 flex flex-col ">
        {selectedConversation ? (
          <>
            <ChatHeader
              name={selectedConversation.name}
              avatar={selectedConversation.avatar}
              isOnline={selectedConversation.isOnline}
              subtitle={
                selectedConversation.role === "staff"
                  ? "Nhân viên"
                  : "Khách hàng"
              }
            />
            <ChatMessagesArea messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-8xl mb-4">💬</div>
              <h2 className="text-2xl font-bold mb-2">
                Chào mừng đến với Chat
              </h2>
              <p className="text-muted-foreground">
                Chọn một cuộc trò chuyện để bắt đầu
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
