import {
  ChevronUp,
  Hash,
  Loader2,
  Send,
  MessageSquare,
  User,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { ChatMessage } from "~/lib/signalr";
import STORAGE, { deleteStorage, setStorage } from "~/lib/storage";

import {
  useChatEntry,
  useChatMessages,
  useChatSession,
} from "~/routes/chat/container/query.hooks";
import { useTranslateMessage } from "~/routes/chat/container/translation.hooks";
import { useChatConnection } from "~/routes/chat/container/use-chat-connection.hooks";
import { MessageBubble } from "~/routes/chat/fragments/message-bubble";
import type { Route } from "./+types/chat";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useServices } from "~/routes/services/container/services/query.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

export default function GuestChat({}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomToken = searchParams.get("roomToken");

  const [inputMessage, setInputMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState(false);
  const { data: menuItems, isPending: isMenuLoading } = useMenuList({});
  const { data: serviceItems, isPending: isServiceLoading } = useServices({});
  const isLoadingItems = isMenuLoading || isServiceLoading;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { translateMessage } = useTranslateMessage();

  // Save roomToken to storage for future use
  useEffect(() => {
    if (roomToken) {
      setStorage(STORAGE.GUEST_ROOM_TOKEN, roomToken);
    }
  }, [roomToken]);

  const {
    data: entry,
    isLoading: isLoadingEntry,
    error: entryError,
  } = useChatEntry(roomToken || "", !!roomToken);
  const sessionId = entry?.canChat ? entry.sessionId : null;

  // Show error dialog if cannot chat
  useEffect(() => {
    if (entry && !entry.canChat) {
      setShowErrorDialog(true);
    }
  }, [entry]);

  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useChatSession(sessionId || "", !!sessionId);

  // Query for messages with manual pagination
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
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
    sessionId: sessionId || "",
    isGuest: true,
  });

  useEffect(() => {
    if (messagesData) {
      setAllMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMessages = messagesData.filter(
          (m) => !existingIds.has(m.id)
        ) as ChatMessage[];
        // Filter out messages without createdAt before sorting
        const validMessages = [...newMessages, ...prev].filter(
          (m) => m.createdAt
        );
        return validMessages.sort(
          (a, b) =>
            new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
        );
      });
    }
  }, [messagesData]); // Load accumulated messages into SignalR state
  useEffect(() => {
    if (allMessages.length > 0) {
      loadMessages(allMessages);
    }
  }, [allMessages, loadMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load more handler
  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const hasMore = messagesData && messagesData.length === 50;

  const handleTranslate = (message: ChatMessage) => {
    translateMessage(message, updateMessage);
  };

  const handleTagItem = (item: any, type: "menu" | "service") => {
    const tag = type === "menu" ? `#món:${item.name}` : `#dv:${item.name}`;
    setInputMessage((prev) => `${prev} ${tag} `.trim()); // Add space after tag
    setIsItemPopoverOpen(false);
    // Focus back to input
    const input = document.getElementById("chat-input");
    input?.focus();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    try {
      await sendMessageViaSignalR(inputMessage);
      setInputMessage("");
      // Force scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      // Error already toasted in hook
    }
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
    deleteStorage(STORAGE.GUEST_ROOM_TOKEN);
    navigate("/");
  };

  if (isLoadingEntry) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center  space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Đang kết nối với lễ tân...
          </p>
        </div>
      </div>
    );
  }

  if (entryError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle />
          </EmptyMedia>
          <EmptyTitle className="text-xl font-semibold text-destructive">
            Lỗi kết nối
          </EmptyTitle>
          <EmptyDescription className="text-sm text-muted-foreground">
            {entryError instanceof Error
              ? entryError.message
              : "Không thể kết nối đến server. Vui lòng thử lại sau."}
          </EmptyDescription>
          <EmptyContent>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Thử lại
            </Button>
          </EmptyContent>
        </EmptyHeader>
      </Empty>
    );
  }

  if (showErrorDialog && entry) {
    return (
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Không thể truy cập</AlertDialogTitle>
            <AlertDialogDescription>{entry.message}</AlertDialogDescription>
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
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Đang tải lịch sử trò chuyện...
          </p>
        </div>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-destructive font-semibold">
            Không tìm thấy phiên chat
          </p>
          <p className="text-sm text-muted-foreground">
            Vui lòng quét lại mã QR hoặc liên hệ lễ tân.
          </p>
          <Button variant="link" onClick={() => navigate("/")}>
            Quay về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const canSendMessage = session.state === "Open";

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Header */}
      <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              LT
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-sm">Lễ Tân (Reception)</h1>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isConnecting ? "bg-yellow-500" : "bg-green-500 animate-pulse"
                )}
              />
              <p className="text-xs text-muted-foreground">
                {isConnecting ? "Đang kết nối..." : "Trực tuyến"}
              </p>
            </div>
          </div>
        </div>
        {/* Optional: Add call button or info button here */}
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative bg-muted/30">
        <ScrollArea className="h-full px-4 py-4" ref={scrollAreaRef}>
          <div className="space-y-6 pb-4">
            {/* Load More Trigger */}
            {hasMore && (
              <div className="flex justify-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="text-xs text-muted-foreground hover:bg-transparent"
                >
                  {isFetching ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <ChevronUp className="h-3 w-3 mr-1" />
                  )}
                  Tải tin nhắn cũ hơn
                </Button>
              </div>
            )}

            {/* Messages List */}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Chưa có tin nhắn nào.
                  <br />
                  Hãy bắt đầu trò chuyện với lễ tân.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                // Check if date changed compared to previous message to show separator
                const prevMsg = messages[index - 1];
                // Only show separator if both messages have createdAt
                const isNewDay =
                  msg.createdAt &&
                  (!prevMsg ||
                    !prevMsg.createdAt ||
                    new Date(msg.createdAt).toDateString() !==
                      new Date(prevMsg.createdAt).toDateString());

                return (
                  <div key={msg.id}>
                    {isNewDay && msg.createdAt && (
                      <div className="flex justify-center my-4">
                        <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {new Date(msg.createdAt).toLocaleDateString("vi-VN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    )}
                    <MessageBubble
                      message={msg}
                      onTranslate={handleTranslate}
                      isGuest={true}
                    />
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="bg-background border-t p-3 pb-safe-area sticky bottom-0 z-20">
        {!canSendMessage ? (
          <div className="p-3 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Phiên chat đã kết thúc
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2 max-w-4xl mx-auto"
          >
            <Popover
              open={isItemPopoverOpen}
              onOpenChange={setIsItemPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Tag món ăn/dịch vụ"
                >
                  <Hash className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="top"
                className="w-80 p-0 overflow-hidden"
                sideOffset={10}
              >
                <div className="bg-muted/50 px-4 py-2 border-b">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                    Gắn thẻ nhanh
                  </h4>
                </div>
                <Tabs defaultValue="menu" className="w-full">
                  <TabsList className="w-full rounded-none border-b bg-transparent p-0 h-10">
                    <TabsTrigger
                      value="menu"
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Món ăn
                    </TabsTrigger>
                    <TabsTrigger
                      value="services"
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Dịch vụ
                    </TabsTrigger>
                  </TabsList>

                  <div className="h-64">
                    <TabsContent value="menu" className="h-full mt-0">
                      {isLoadingItems ? (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <ScrollArea className="h-full">
                          {menuItems && menuItems.length > 0 ? (
                            <div className="p-1">
                              {menuItems.map((item) => (
                                <button
                                  key={item.itemId}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors group"
                                  onClick={() => handleTagItem(item, "menu")}
                                >
                                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="flex justify-between items-center mt-0.5">
                                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
                                      {item.description || "Không có mô tả"}
                                    </span>
                                    <span className="text-xs font-mono">
                                      {item.price?.toLocaleString()}đ
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                              Không có dữ liệu
                            </div>
                          )}
                        </ScrollArea>
                      )}
                    </TabsContent>

                    <TabsContent value="services" className="h-full mt-0">
                      {/* Similar structure for services */}
                      <ScrollArea className="h-full">
                        {serviceItems && serviceItems.length > 0 ? (
                          <div className="p-1">
                            {serviceItems.map((item) => (
                              <button
                                key={item.serviceItemId}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors group"
                                onClick={() => handleTagItem(item, "service")}
                              >
                                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                                  {item.name}
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                  <span className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
                                    {item.description || "Không có mô tả"}
                                  </span>
                                  <span className="text-xs font-mono">
                                    {item.basePrice?.toLocaleString()}đ
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-xs text-muted-foreground">
                            Không có dữ liệu
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </PopoverContent>
            </Popover>

            <div className="flex-1 relative">
              <Input
                id="chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                disabled={isConnecting}
                className="pr-10 rounded-full bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/20 focus-visible:border-primary"
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              size="icon"
              className="rounded-full shrink-0 shadow-sm"
              disabled={!inputMessage.trim() || isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
