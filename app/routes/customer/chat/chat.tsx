import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Send, Loader2, Languages, Globe } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  useChatEntry,
  useChatMessages,
  useChatSession,
} from "~/routes/chat/container/query.hooks";
import { useTranslateMessage } from "~/routes/chat/container/translation.hooks";
import { signalRChatService, type ChatMessage } from "~/lib/signalr";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useChatTranslationStore } from "~/store/chat-translation.store";
import { SUPPORTED_LANGUAGES } from "~/lib/constants";
import type { Route } from "./+types/chat";
import Image from "~/components/ui/image";

interface MessageBubbleProps {
  message: ChatMessage;
  onTranslate?: (message: ChatMessage) => void;
  isGuest?: boolean;
}

const MessageBubble = ({
  message,
  onTranslate,
  isGuest = false,
}: MessageBubbleProps) => {
  const isStaff = message.sender === "Staff";
  const isSystem = message.sender === "System";
  const isOwnMessage = isGuest && message.sender === "Guest";

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
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {isStaff ? message.staffName?.[0] || "S" : "K"}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3",
          isOwnMessage
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

        {message.translatedText && message.showTranslation && (
          <div
            className={cn(
              "mt-2 pt-2 border-t",
              isOwnMessage
                ? "border-primary-foreground/20"
                : "border-muted-foreground/20"
            )}
          >
            <p
              className={cn(
                "text-xs mb-1",
                isOwnMessage ? "opacity-70" : "text-muted-foreground"
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
              isOwnMessage ? "opacity-70" : "text-muted-foreground"
            )}
          >
            {format(parseISO(message.createdAt), "HH:mm", { locale: vi })}
          </p>

          {!isSystem && onTranslate && (
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-6 px-2 py-0",
                isOwnMessage
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
      {isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default function GuestChat({}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomToken = searchParams.get("roomToken");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const {
    data: entry,
    isLoading: isLoadingEntry,
    error: entryError,
  } = useChatEntry(roomToken || "", !!roomToken);
  const sessionId = entry?.canChat ? entry.sessionId : null;

  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useChatSession(sessionId || "", !!sessionId);
  const {
    data: messageHistory,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useChatMessages(sessionId || "", !!sessionId);

  useEffect(() => {
    if (!roomToken) {
      setErrorMessage("Không tìm thấy mã phòng. Vui lòng quét lại mã QR.");
      setShowErrorDialog(true);
      return;
    }

    if (entryError) {
      setErrorMessage(
        "Không thể kết nối. Vui lòng kiểm tra kết nối và thử lại."
      );
      setShowErrorDialog(true);
      return;
    }

    if (entry && !entry.canChat) {
      setErrorMessage(
        entry.message ||
          "Phòng này hiện không có khách lưu trú hoặc chưa đến thời gian check-in."
      );
      setShowErrorDialog(true);
    }
  }, [roomToken, entry, entryError]);

  useEffect(() => {
    if (!sessionId) return;

    const connectSignalR = async () => {
      setIsConnecting(true);
      try {
        await signalRChatService.connect(import.meta.env.VITE_CHAT_HUB_URL);
        await signalRChatService.joinSession(sessionId);

        signalRChatService.onReceiveMessage(async (message: ChatMessage) => {
          if (autoTranslateEnabled && message.sender === "Staff") {
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

        console.log("[Guest Chat] Connected to session:", sessionId);
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
  }, [sessionId, autoTranslateEnabled, autoTranslateMessage]);

  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debug logging
  useEffect(() => {
    console.log("[Guest Chat Debug]", {
      sessionId,
      session,
      isLoadingSession,
      sessionError,
      entry,
    });
  }, [sessionId, session, isLoadingSession, sessionError, entry]);

  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  const handleTranslate = (message: ChatMessage) => {
    translateMessage(message, updateMessage);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    try {
      await signalRChatService.sendMessage({
        sessionId,
        message: inputMessage.trim(),
        sender: "Guest",
      });
      setInputMessage("");
    } catch (error) {
      toast.error("Không thể gửi tin nhắn");
      console.error(error);
    }
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    navigate("/");
  };

  if (isLoadingEntry) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showErrorDialog) {
    return (
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Không thể truy cập Chat</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDialogClose}>
              Đóng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (isLoadingSession || isLoadingMessages) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Đang tải phiên chat...
          </p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive font-semibold">Lỗi tải phiên chat</p>
          <p className="text-sm text-muted-foreground">
            {sessionError instanceof Error
              ? sessionError.message
              : "Không thể kết nối đến server"}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Không tìm thấy phiên chat</p>
          <p className="text-sm text-muted-foreground">
            Session ID: {sessionId || "N/A"}
          </p>
        </div>
      </div>
    );
  }

  const canSendMessage = session.state === "Open";

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b p-4 bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <Image src="https://api.dicebear.com/9.x/glass/svg" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">NOVA Hotel Chat</h2>
            <p className="text-sm text-muted-foreground">
              {session.roomName} • {session.customerName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

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
            isGuest={true}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

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
