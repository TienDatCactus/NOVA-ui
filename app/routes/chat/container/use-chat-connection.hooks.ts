import { useEffect, useState, useCallback } from "react";
import {
  signalRChatService,
  type ChatMessage,
  type SendMessageCommand,
} from "~/lib/signalr";
import { toast } from "sonner";

interface UseChatConnectionOptions {
  sessionId: string | null;
  isGuest?: boolean;
  userId?: string; // Staff user ID
}

export function useChatConnection({
  sessionId,
  isGuest = false,
  userId,
}: UseChatConnectionOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Guard: Don't connect without valid sessionId
    if (!sessionId || sessionId.trim() === "") {
      console.log(
        "[useChatConnection] No valid sessionId, skipping connection"
      );
      setIsConnected(false);
      return;
    }

    const chatHubUrl = import.meta.env.VITE_CHAT_HUB_URL;
    if (!chatHubUrl) {
      toast.error("Lỗi cấu hình chat. Vui lòng liên hệ quản trị viên.");
      return;
    }

    const connectSignalR = async () => {
      console.log(
        `[useChatConnection] Starting connection for session: ${sessionId}`
      );
      console.log("[useChatConnection] Chat Hub URL:", chatHubUrl);
      setIsConnecting(true);
      setIsConnected(false);
      try {
        await signalRChatService.connect(chatHubUrl);
        console.log("[useChatConnection] ✅ SignalR connected");

        await signalRChatService.joinSession(sessionId);
        console.log(`[useChatConnection] ✅ Joined session: ${sessionId}`);

        signalRChatService.onReceiveMessage((message: ChatMessage) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
        });

        setIsConnected(true);
        console.log(
          `[${isGuest ? "Guest" : "Staff"} Chat] ✅ Fully connected to session:`,
          sessionId
        );
      } catch (error) {
        console.error("[useChatConnection] ❌ Connection failed:", error);
        toast.error("Không thể kết nối chat. Vui lòng tải lại trang.");
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    connectSignalR();

    return () => {
      console.log(`[useChatConnection] Cleanup for session: ${sessionId}`);
      if (sessionId) {
        signalRChatService.leaveSession(sessionId).catch(console.error);
      }
      signalRChatService.offAll("ReceiveMessage");
      setIsConnected(false);
    };
  }, [sessionId, isGuest]);

  // Update a message in the list (for translation toggle)
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
      );
    },
    []
  );

  // Send a message
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !sessionId) {
        console.warn("[Hook] Send aborted - validation failed:", {
          hasMessage: !!messageText.trim(),
          hasSessionId: !!sessionId,
        });
        return;
      }

      // Guard: Check if connected
      if (!isConnected) {
        console.error(
          "[Hook] ❌ Cannot send message: Not connected to SignalR"
        );
        console.error("Connection state:", { isConnecting, isConnected });
        toast.error("Chưa kết nối đến chat. Vui lòng đợi...");
        return;
      }

      console.group(
        `[Hook] Preparing SendMessage (${isGuest ? "Guest" : "Staff"})`
      );
      console.log("Session ID:", sessionId);
      console.log("Message Text:", messageText);
      console.log("Sender:", isGuest ? "Guest" : "Staff");
      console.log("User ID:", userId || "(undefined)");
      console.log("Is Guest:", isGuest);
      console.log("Is Connected:", isConnected);
      console.groupEnd();

      try {
        const command: SendMessageCommand = {
          sessionId,
          message: messageText.trim(),
          sender: isGuest ? "Guest" : "Staff",
          staffUserId: userId,
        };

        console.log(
          "[Hook] Calling signalRChatService.sendMessage with:",
          command
        );
        await signalRChatService.sendMessage(command);
        console.log("[Hook] ✅ Message sent successfully");
      } catch (error) {
        console.group("[Hook] ❌ SendMessage Error");
        console.error("Error caught in hook:", error);
        console.error("Context:", {
          sessionId,
          messageLength: messageText.length,
          isGuest,
          userId,
          userIdType: typeof userId,
        });
        console.groupEnd();

        toast.error("Không thể gửi tin nhắn");
        throw error;
      }
    },
    [sessionId, isGuest, userId, isConnected]
  );

  // Load initial message history (passed from parent)
  const loadMessages = useCallback((messageHistory: ChatMessage[]) => {
    setMessages(messageHistory);
  }, []);

  return {
    messages,
    setMessages,
    isConnecting,
    isConnected,
    updateMessage,
    sendMessage,
    loadMessages,
  };
}
