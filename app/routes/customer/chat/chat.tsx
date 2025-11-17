import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
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
import { Send, Loader2, Globe, ChevronUp } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  useChatEntry,
  useChatMessages,
  useChatSession,
} from "~/routes/chat/container/query.hooks";
import { useTranslateMessage } from "~/routes/chat/container/translation.hooks";
import { useChatConnection } from "~/routes/chat/container/use-chat-connection.hooks";
import { MessageBubble } from "~/routes/chat/fragments/message-bubble";
import type { ChatMessage } from "~/lib/signalr";
import { toast } from "sonner";
import { useChatTranslationStore } from "~/store/chat-translation.store";
import { SUPPORTED_LANGUAGES } from "~/lib/constants";
import type { Route } from "./+types/chat";
import Image from "~/components/ui/image";

export default function GuestChat({}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomToken = searchParams.get("roomToken");

  const [inputMessage, setInputMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { userLanguage, setUserLanguage } = useChatTranslationStore();
  const { translateMessage } = useTranslateMessage();

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

  // Query for messages with manual pagination
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
    isFetching,
  } = useChatMessages(sessionId || "", !!sessionId, {
    page: currentPage,
    pageSize: 50,
  });

  const {
    messages,
    isConnecting,
    updateMessage,
    sendMessage: sendMessageViaSignalR,
    loadMessages,
  } = useChatConnection({
    sessionId,
    isGuest: true,
  });

  // Accumulate messages from multiple pages
  useEffect(() => {
    if (messagesData) {
      setAllMessages((prev) => {
        // Prepend new page messages (older messages go to top)
        const existingIds = new Set(prev.map((m) => m.id));
        const newMessages = messagesData.filter((m) => !existingIds.has(m.id));
        return [...newMessages, ...prev];
      });
    }
  }, [messagesData]);

  // Load accumulated messages into SignalR state
  useEffect(() => {
    if (allMessages.length > 0) {
      loadMessages(allMessages);
    }
  }, [allMessages, loadMessages]);

  // Entry validation
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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load more handler
  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Check if there might be more messages
  const hasMore = messagesData && messagesData.length === 50;

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

  const handleTranslate = (message: ChatMessage) => {
    translateMessage(message, updateMessage);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    try {
      await sendMessageViaSignalR(inputMessage);
      setInputMessage("");
    } catch (error) {
      // Error already toasted in hook
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
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={isFetching}
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Xem thêm tin nhắn cũ
                </>
              )}
            </Button>
          </div>
        )}

        {/* Connection status */}
        {isConnecting && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {/* Messages list */}
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
