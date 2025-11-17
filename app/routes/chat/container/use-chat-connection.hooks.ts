import { useEffect, useState, useCallback } from "react";
import { signalRChatService, type ChatMessage } from "~/lib/signalr";
import { toast } from "sonner";

interface UseChatConnectionOptions {
  sessionId: string | null;
  isGuest?: boolean;
  userId?: string; // Staff user ID
}

/**
 * Shared hook for managing SignalR chat connection, messages, and sending
 * Used by both staff chat and guest chat components
 */
export function useChatConnection({
  sessionId,
  isGuest = false,
  userId,
}: UseChatConnectionOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const connectSignalR = async () => {
      setIsConnecting(true);
      try {
        await signalRChatService.connect(import.meta.env.VITE_CHAT_HUB_URL);
        await signalRChatService.joinSession(sessionId);

        signalRChatService.onReceiveMessage((message: ChatMessage) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
        });

        console.log(
          `[${isGuest ? "Guest" : "Staff"} Chat] Connected to session:`,
          sessionId
        );
      } catch (error) {
        toast.error("Không thể kết nối chat. Vui lòng tải lại trang.");
        console.error(error);
      } finally {
        setIsConnecting(false);
      }
    };

    connectSignalR();

    return () => {
      if (sessionId) {
        signalRChatService.leaveSession(sessionId);
      }
      signalRChatService.offAll("ReceiveMessage");
    };
  }, [sessionId]);

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
      if (!messageText.trim() || !sessionId) return;

      try {
        await signalRChatService.sendMessage({
          sessionId,
          message: messageText.trim(),
          sender: isGuest ? "Guest" : "Staff",
          staffUserId: userId,
        });
      } catch (error) {
        toast.error("Không thể gửi tin nhắn");
        console.error(error);
        throw error;
      }
    },
    [sessionId, isGuest, userId]
  );

  // Load initial message history (passed from parent)
  const loadMessages = useCallback((messageHistory: ChatMessage[]) => {
    setMessages(messageHistory);
  }, []);

  return {
    messages,
    setMessages,
    isConnecting,
    updateMessage,
    sendMessage,
    loadMessages,
  };
}
