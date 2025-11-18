import { ChevronUp, Hash, Loader2, Send } from "lucide-react";
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

export default function GuestChat({}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomToken = searchParams.get("roomToken");

  const [inputMessage, setInputMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const hasMore = messagesData && messagesData.length === 50;

  const handleTranslate = (message: ChatMessage) => {
    translateMessage(message, updateMessage);
  };

  const loadItemsForTagging = async () => {
    if (menuItems.length > 0 || serviceItems.length > 0) return; // Already loaded

    setIsLoadingItems(true);
    try {
      const { data: menuResponse } = useMenuList({});
      const { data: serviceResponse } = useServices({});
      setMenuItems(menuResponse || []);
      setServiceItems(serviceResponse || []);
    } catch (error) {
      console.error("Failed to load items:", error);
      toast.error("Không thể tải danh sách món ăn và dịch vụ");
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleTagItem = (item: any, type: "menu" | "service") => {
    const tag = type === "menu" ? `#món:${item.name}` : `#dv:${item.name}`;
    setInputMessage((prev) => `${prev} ${tag}`.trim());
    setIsItemPopoverOpen(false);
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
    deleteStorage(STORAGE.GUEST_ROOM_TOKEN);
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
      <div className="flex-1 overflow-y-auto space-y-4 bg-background ">
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
            <Popover
              open={isItemPopoverOpen}
              onOpenChange={setIsItemPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsItemPopoverOpen(true);
                    loadItemsForTagging();
                  }}
                  disabled={isConnecting}
                  title="Tag món ăn hoặc dịch vụ"
                >
                  <Hash className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80">
                <Tabs defaultValue="menu" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="menu">Món ăn</TabsTrigger>
                    <TabsTrigger value="services">Dịch vụ</TabsTrigger>
                  </TabsList>
                  <TabsContent value="menu" className="mt-2">
                    {isLoadingItems ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : menuItems.length > 0 ? (
                      <ScrollArea className="h-64">
                        <div className="space-y-1">
                          {menuItems.map((item) => (
                            <Button
                              key={item.itemId}
                              variant="ghost"
                              className="w-full justify-start text-left h-auto py-2"
                              onClick={() => handleTagItem(item, "menu")}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{item.name}</span>
                                {item.description && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </span>
                                )}
                                <span className="text-xs text-primary">
                                  {item.price?.toLocaleString("vi-VN")} VNĐ
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Không có món ăn
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="services" className="mt-2">
                    {isLoadingItems ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : serviceItems.length > 0 ? (
                      <ScrollArea className="h-64">
                        <div className="space-y-1">
                          {serviceItems.map((item) => (
                            <Button
                              key={item.serviceItemId}
                              variant="ghost"
                              className="w-full justify-start text-left h-auto py-2"
                              onClick={() => handleTagItem(item, "service")}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{item.name}</span>
                                {item.description && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </span>
                                )}
                                <span className="text-xs text-primary">
                                  {item.basePrice?.toLocaleString("vi-VN")} VNĐ
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Không có dịch vụ
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>
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
