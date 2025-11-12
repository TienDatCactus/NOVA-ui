import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type { Route } from "./+types/chat";
import ChatHeader from "./components/chat-header";
import ChatInput from "./components/chat-input";
import ChatMessagesArea from "./components/chat-messages-area";
import ChatSidebar from "./components/chat-sidebar";
import { useChatEntry, useChatMessages } from "./container/query.hooks";
import { useSendMessage } from "./container/mutation.hooks";
import { useChatHub } from "./container/useChatHub";
import { useStaffInboxContainer } from "./container/inbox.hooks";
import type {
  ChatMessageDto,
  SignalRMessageEventDto,
} from "~/services/api/chat/dto";
import { Card } from "~/components/ui/card";
import { MessageCircleCode } from "lucide-react";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  // Extract roomToken from URL for guest entry flow
  const url = new URL(request.url);
  const roomToken = url.searchParams.get("roomToken");
  return { roomToken };
};

// UI Message type for rendering
interface UIMessage {
  id: string;
  content: string;
  timestamp: string; // ISO
  isOwn: boolean;
  senderName?: string;
  status: "sending" | "sent" | "delivered" | "read";
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { roomToken } = loaderData as { roomToken?: string };
  const [optimisticMessages, setOptimisticMessages] = useState<UIMessage[]>([]);

  // Staff inbox mode (when no roomToken)
  const {
    conversations: staffConversations,
    selectedConversation: staffSelectedConversation,
    selectedSessionId: staffSelectedSessionId,
    setSelectedSessionId: setStaffSelectedSessionId,
    filters,
    updateFilter,
    resetFilters,
    isLoading: inboxLoading,
    hasNextPage,
    fetchNextPage,
  } = useStaffInboxContainer();

  // Guest mode state
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  // Determine active session ID based on mode
  const activeSessionId = roomToken ? guestSessionId : staffSelectedSessionId;
  const isGuestMode = !!roomToken;

  // Guest entry flow
  const {
    data: entryData,
    isLoading: entryLoading,
    isError: entryError,
  } = useChatEntry(roomToken || "", { enabled: isGuestMode });

  // Extract session info from entry response
  useEffect(() => {
    if (entryData?.canChat && entryData.sessionId) {
      setGuestSessionId(entryData.sessionId);
      toast.success(
        `Kết nối phòng ${entryData.roomName} thành công. Bạn có thể bắt đầu chat.`
      );
    } else if (entryData && !entryData.canChat) {
      toast.error(entryData.message || "Không thể vào phiên chat.");
    }
  }, [entryData]);

  // Fetch messages from API
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useChatMessages({
    sessionId: activeSessionId || "",
    enabled: !!activeSessionId,
  });

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // SignalR connection
  const {
    isConnected: signalRConnected,
    sendMessage: sendMessageViaHub,
    sendTyping,
  } = useChatHub({
    sessionId: activeSessionId || undefined,
    autoConnect: !!activeSessionId,
    onReceiveMessage: useCallback(
      (msg: SignalRMessageEventDto) => {
        // Refetch messages when new message arrives
        refetchMessages();
      },
      [refetchMessages]
    ),
  });

  // Combine API messages + optimistic messages
  const allMessages = useMemo<UIMessage[]>(() => {
    const apiMessages: UIMessage[] =
      messagesData?.items.map((m: ChatMessageDto) => ({
        id: m.id,
        content: m.message,
        timestamp: m.createdAt,
        isOwn: m.sender === (isGuestMode ? "Guest" : "Staff"),
        senderName:
          m.sender === (isGuestMode ? "Staff" : "Guest")
            ? isGuestMode
              ? "Nhân viên"
              : staffSelectedConversation?.customerName || "Khách"
            : undefined,
        status: "delivered" as const,
      })) || [];

    return [...apiMessages, ...optimisticMessages];
  }, [
    messagesData,
    optimisticMessages,
    isGuestMode,
    staffSelectedConversation,
  ]);

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) {
      toast.error("Không có phiên chat. Vui lòng thử lại.");
      return;
    }

    const tempId = crypto.randomUUID();
    const optimistic: UIMessage = {
      id: tempId,
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: "sending",
    };

    // Add optimistic message
    setOptimisticMessages((prev) => [...prev, optimistic]);

    const senderValue = isGuestMode ? ("Guest" as const) : ("Staff" as const);
    const payload = {
      sessionId: activeSessionId,
      message: content,
      sender: senderValue,
    };

    try {
      // Try SignalR first, fallback to REST
      if (signalRConnected) {
        await sendMessageViaHub(payload);
      } else {
        await sendMessageMutation.mutateAsync(payload);
      }

      // Mark as sent
      setOptimisticMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: "sent" as const } : m
        )
      );

      // Remove optimistic message after a delay (real message will come from refetch)
      setTimeout(() => {
        setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
      }, 1000);
    } catch (err) {
      console.error("Send message error:", err);
      setOptimisticMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                content: `${m.content} (gửi thất bại)`,
                status: "delivered" as const,
              }
            : m
        )
      );
      toast.error("Gửi tin nhắn thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex h-screen bg-muted">
      {/* Sidebar - only show in staff mode */}
      {!isGuestMode && (
        <ChatSidebar
          conversations={staffConversations}
          selectedSessionId={staffSelectedSessionId}
          onSelectConversation={setStaffSelectedSessionId}
          filters={filters}
          onFilterChange={updateFilter}
          isLoading={inboxLoading}
          hasNextPage={hasNextPage}
          onLoadMore={fetchNextPage}
          totalCount={staffConversations.length}
        />
      )}

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col bg-card shadow-sm rounded-none">
        {isGuestMode && entryData && !entryData.canChat && !entryLoading ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="max-w-md text-center space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Không thể vào chat
              </h2>
              <p className="text-sm text-muted-foreground">
                {entryData.message ||
                  "Phòng này hiện không có khách lưu trú hoặc phiên đã hết hạn. Vui lòng liên hệ lễ tân để được hỗ trợ."}
              </p>
              {entryData.reason && (
                <p className="text-xs text-muted-foreground font-mono">
                  Mã lỗi: {entryData.reason}
                </p>
              )}
            </div>
          </div>
        ) : activeSessionId || (isGuestMode && guestSessionId) ? (
          <>
            <ChatHeader
              name={
                isGuestMode && entryData?.canChat
                  ? `Phòng ${entryData.roomName} - ${entryData.customerName}`
                  : staffSelectedConversation
                    ? `${staffSelectedConversation.roomName} - ${staffSelectedConversation.customerName}`
                    : "Chat"
              }
              isOnline={signalRConnected}
              subtitle={
                isGuestMode
                  ? "Khách hàng"
                  : staffSelectedConversation?.assignedStaffName
                    ? `Nhân viên: ${staffSelectedConversation.assignedStaffName}`
                    : "Chưa phân công"
              }
              sessionStatus={
                isGuestMode
                  ? entryData?.canChat
                    ? "Active"
                    : "Closed"
                  : staffSelectedConversation?.status || "Active"
              }
              roomName={
                isGuestMode
                  ? entryData?.roomName
                  : staffSelectedConversation?.roomName
              }
            />
            <ChatMessagesArea
              messages={allMessages}
              isLoading={entryLoading || messagesLoading}
            />
            <div className="border-t border-border">
              {isGuestMode && !guestSessionId ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {entryLoading
                    ? "Đang khởi tạo phiên chat..."
                    : "Đang kết nối..."}
                </div>
              ) : (
                <ChatInput
                  onSendMessage={handleSendMessage}
                  disabled={
                    !activeSessionId ||
                    (isGuestMode ? !entryData?.canChat : false) ||
                    sendMessageMutation.isPending
                  }
                  placeholder={
                    !activeSessionId ? "Đang kết nối..." : "Nhập tin nhắn..."
                  }
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-4 flex items-center">
                <MessageCircleCode />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                Chat với khách hàng
              </h2>
              <p className="text-muted-foreground">
                {isGuestMode
                  ? "Đang khởi tạo phiên chat..."
                  : "Chọn một cuộc trò chuyện để bắt đầu"}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
