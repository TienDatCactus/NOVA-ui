import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Send,
  Loader2,
  UserCheck,
  XCircle,
  Languages,
  Globe,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  useChatMessages,
  useChatSession,
  useAssignStaff,
  useCloseSession,
} from "../container/query.hooks";
import { useTranslateMessage } from "../container/translation.hooks";
import { signalRChatService, type ChatMessage } from "~/lib/signalr";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useAuthStore } from "~/store/auth.store";
import { useChatTranslationStore } from "~/store/chat-translation.store";
import { SUPPORTED_LANGUAGES } from "~/lib/constants";

interface MessageBubbleProps {
  message: ChatMessage;
  onTranslate?: (message: ChatMessage) => void;
}

const MessageBubble = ({ message, onTranslate }: MessageBubbleProps) => {
  const isStaff = message.sender === "Staff";
  const isSystem = message.sender === "System";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted px-4 py-2 rounded-full">
          <p className="text-xs text-muted-foreground">{message.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isStaff ? "justify-end" : "justify-start"
      )}
    >
      {!isStaff && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>K</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3",
          isStaff
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-muted rounded-bl-none"
        )}
      >
        {isStaff && message.staffName && (
          <p className="text-xs font-semibold mb-1 opacity-90">
            {message.staffName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.message}
        </p>

        {/* Translation section */}
        {message.translatedText && message.showTranslation && (
          <div
            className={cn(
              "mt-2 pt-2 border-t",
              isStaff
                ? "border-primary-foreground/20"
                : "border-muted-foreground/20"
            )}
          >
            <p
              className={cn(
                "text-xs mb-1",
                isStaff ? "opacity-70" : "text-muted-foreground"
              )}
            >
              Đã dịch từ {message.detectedLanguage || "ngôn ngữ khác"}
            </p>
            <p className="text-sm whitespace-pre-wrap break-words opacity-90">
              {message.translatedText}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-1 gap-2">
          <p
            className={cn(
              "text-xs",
              isStaff ? "opacity-70" : "text-muted-foreground"
            )}
          >
            {format(parseISO(message.createdAt), "HH:mm", { locale: vi })}
          </p>

          {/* Translation toggle button */}
          {!isSystem && onTranslate && (
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-6 px-2 py-0",
                isStaff
                  ? "hover:bg-primary-foreground/20 text-primary-foreground"
                  : "hover:bg-muted-foreground/10"
              )}
              onClick={() => onTranslate(message)}
              disabled={message.isTranslating}
            >
              {message.isTranslating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Languages className="h-3 w-3 mr-1" />
                  <span className="text-xs">
                    {message.showTranslation ? "Bản gốc" : "Dịch"}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      {isStaff && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{message.staffName?.[0] || "S"}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

interface ChatMainProps {
  sessionId: string | null;
}

export function ChatMain({ sessionId }: ChatMainProps) {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Translation state
  const {
    userLanguage,
    autoTranslateEnabled,
    setUserLanguage,
    setAutoTranslate,
  } = useChatTranslationStore();
  const { translateMessage, autoTranslateMessage } = useTranslateMessage();

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === userLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const { data: session, isLoading: isLoadingSession } = useChatSession(
    sessionId || "",
    !!sessionId
  );
  const { data: messageHistory, isLoading: isLoadingMessages } =
    useChatMessages(sessionId || "", !!sessionId);

  const assignStaffMutation = useAssignStaff();
  const closeSessionMutation = useCloseSession();

  // Connect to SignalR and join session
  useEffect(() => {
    if (!sessionId) return;

    const connectSignalR = async () => {
      setIsConnecting(true);
      try {
        await signalRChatService.connect(import.meta.env.VITE_CHAT_HUB_URL);
        await signalRChatService.joinSession(sessionId);
        signalRChatService.onReceiveMessage(async (message: ChatMessage) => {
          // Auto-translate guest messages if enabled
          if (autoTranslateEnabled && message.sender === "Guest") {
            const translatedMessage = await autoTranslateMessage(message);
            setMessages((prev) => {
              if (prev.some((m) => m.id === translatedMessage.id)) return prev;
              return [...prev, translatedMessage];
            });
          } else {
            setMessages((prev) => {
              if (prev.some((m) => m.id === message.id)) return prev;
              return [...prev, message];
            });
          }
        });

        console.log("[Chat] Connected to session:", sessionId);
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

  // Load initial messages
  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update message state (for translation)
  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  // Handle translation toggle
  const handleTranslate = (message: ChatMessage) => {
    translateMessage(message, updateMessage);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || !user) return;

    try {
      await signalRChatService.sendMessage({
        sessionId,
        message: inputMessage.trim(),
        sender: "Staff",
        staffUserId: user.id,
      });
      setInputMessage("");
    } catch (error) {
      toast.error("Không thể gửi tin nhắn");
      console.error(error);
    }
  };

  // Assign self to session
  const handleAssignSelf = () => {
    if (!sessionId || !user) return;
    assignStaffMutation.mutate(
      {
        sessionId,
        staffUserId: user.id,
      },
      {
        onSuccess: () => {
          toast.success("Đã nhận xử lý chat này");
        },
        onError: () => {
          toast.error("Không thể gán nhân viên");
        },
      }
    );
  };

  // Close session
  const handleCloseSession = () => {
    if (!sessionId) return;
    closeSessionMutation.mutate(sessionId, {
      onSuccess: () => {
        toast.success("Đã đóng phiên chat");
      },
      onError: () => {
        toast.error("Không thể đóng phiên chat");
      },
    });
  };

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium mb-1">Chọn một cuộc trò chuyện</p>
          <p className="text-sm text-muted-foreground">
            Chọn một tin nhắn từ danh sách bên trái để bắt đầu
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingSession || isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy phiên chat</p>
      </div>
    );
  }

  const isAssignedToMe = session.assignedStaffUserId === user?.id;
  const canSendMessage = session.state === "Open";

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4 bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{session.customerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{session.customerName}</h2>
            <p className="text-sm text-muted-foreground">
              Phòng {session.roomName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session.assignedStaffName && (
            <Badge variant="outline">
              <UserCheck className="h-3 w-3 mr-1" />
              {session.assignedStaffName}
            </Badge>
          )}

          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                {currentLanguage.flag} {currentLanguage.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setUserLanguage(lang.code)}
                  className={cn(userLanguage === lang.code && "bg-muted")}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auto-translate toggle */}
          <div className="flex items-center gap-2 border rounded-md px-3 py-1.5">
            <Switch
              id="auto-translate"
              checked={autoTranslateEnabled}
              onCheckedChange={setAutoTranslate}
            />
            <Label htmlFor="auto-translate" className="text-sm cursor-pointer">
              Tự động dịch
            </Label>
          </div>

          {!session.assignedStaffUserId && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAssignSelf}
              disabled={assignStaffMutation.isPending}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Nhận xử lý
            </Button>
          )}

          {canSendMessage && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleCloseSession}
              disabled={closeSessionMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Đóng chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {isConnecting && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onTranslate={handleTranslate}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-card">
        {!canSendMessage ? (
          <div className="text-center text-sm text-muted-foreground py-2">
            Phiên chat đã đóng
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={isConnecting}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isConnecting}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
