import {
  AlertTriangle,
  ChevronUp,
  CloudFog,
  Hash,
  Leaf,
  Loader2,
  Map as MapIcon,
  MessageSquare,
  Mountain,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
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

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { cn } from "~/lib/utils";
import {
  useChatEntry,
  useChatMessages,
  useChatSession,
} from "~/routes/chat/container/query.hooks";
import { useTranslateMessage } from "~/routes/chat/container/translation.hooks";
import { useChatConnection } from "~/routes/chat/container/use-chat-connection.hooks";
import { MessageBubble } from "~/routes/chat/fragments/message-bubble";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useServices } from "~/routes/services/container/services/query.hooks";
import type { Route } from "./+types/chat";
import { BackgroundLayer } from "~/routes/chat/components/chat-main";

export default function GuestChat({}: Route.ComponentProps) {
  const { t } = useTranslation("chat");
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
    isConnected,
    updateMessage,
    sendMessage: sendMessageViaSignalR,
    loadMessages,
  } = useChatConnection({
    sessionId: sessionId ?? null,
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
      <div className="flex h-dvh items-center justify-center bg-stone-50">
        <BackgroundLayer />
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-200/40 rounded-full blur-xl animate-pulse"></div>
            <CloudFog className="h-12 w-12 animate-bounce text-emerald-600/70 duration-[2000ms] relative z-10" />
          </div>
          <p className="text-sm font-medium text-emerald-800/60 animate-pulse tracking-wide">
            {t("chat.connectingReception", "Connecting to the valley...")}
          </p>
        </div>
      </div>
    );
  }

  if (entryError) {
    return (
      <Empty>
        <BackgroundLayer />
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="bg-red-50 text-red-500 rounded-full p-4"
          >
            <AlertTriangle className="h-8 w-8" />
          </EmptyMedia>
          <EmptyTitle className="text-xl font-serif font-bold text-red-700">
            {t("chat.connectionError")}
          </EmptyTitle>
          <EmptyDescription className="text-sm text-stone-500">
            {entryError instanceof Error
              ? entryError.message
              : t("chat.serverError")}
          </EmptyDescription>
          <EmptyContent>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
            >
              {t("chat.retry")}
            </Button>
          </EmptyContent>
        </EmptyHeader>
      </Empty>
    );
  }

  if (showErrorDialog && entry) {
    return (
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="bg-background/90 backdrop-blur-md border-stone-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-800">
              {t("chat.cannotAccess")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-stone-600">
              {entry.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleErrorDialogClose}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              {t("chat.close")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (isLoadingSession || isLoadingMessages) {
    return (
      <div className="flex h-dvh items-center justify-center bg-stone-50">
        <BackgroundLayer />
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm text-stone-500">{t("chat.loadingHistory")}</p>
        </div>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="flex h-dvh items-center justify-center bg-stone-50">
        <BackgroundLayer />
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-stone-200/50 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200">
            <Mountain className="h-8 w-8 text-stone-400" />
          </div>
          <p className="text-stone-800 font-semibold font-serif">
            {t("chat.sessionNotFound")}
          </p>
          <p className="text-sm text-stone-500">{t("chat.rescanQR")}</p>
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-emerald-700"
          >
            {t("chat.backHome")}
          </Button>
        </div>
      </div>
    );
  }

  const canSendMessage = session.state === "Open";

  return (
    <div className="flex flex-col h-dvh relative selection:bg-emerald-200 selection:text-emerald-900 font-sans">
      <BackgroundLayer />

      {/* Header - Glassmorphic */}
      <header className="h-16 border-b border-white/20 bg-background/60 backdrop-blur-xl flex items-center px-4 justify-between sticky top-0 z-20 shadow-sm shadow-stone-900/5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/50 shadow-sm">
            <AvatarFallback className="bg-emerald-100 text-emerald-800 font-medium font-serif">
              LT
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-sm text-stone-800">
              {t("chat.reception")}
            </h1>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-2 h-2 rounded-full shadow-sm",
                  isConnecting
                    ? "bg-amber-400 animate-pulse"
                    : isConnected
                      ? "bg-emerald-500 shadow-emerald-200"
                      : "bg-stone-300"
                )}
              />
              <p className="text-xs text-stone-500">
                {isConnecting
                  ? t("chat.connecting")
                  : isConnected
                    ? t("chat.active")
                    : t("chat.disconnected")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area - Transparent to show pattern */}
      <div className="flex-1 overflow-hidden relative">
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
                  className="text-xs text-stone-400 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-full"
                >
                  {isFetching ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <ChevronUp className="h-3 w-3 mr-1" />
                  )}
                  {t("chat.loadOlder")}
                </Button>
              </div>
            )}

            {/* Messages List */}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 opacity-70">
                <div className="w-16 h-16 bg-background/40 rounded-full flex items-center justify-center border border-white/60">
                  <Leaf className="h-8 w-8 text-emerald-800/30" />
                </div>
                <p className="text-sm text-stone-500 font-medium">
                  {t("chat.noMessages")}
                  <br />
                  <span className="text-xs font-normal opacity-70">
                    {t("chat.startChat")}
                  </span>
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const isNewDay =
                  msg.createdAt &&
                  (!prevMsg ||
                    !prevMsg.createdAt ||
                    new Date(msg.createdAt).toDateString() !==
                      new Date(prevMsg.createdAt).toDateString());

                return (
                  <div key={msg.id}>
                    {isNewDay && msg.createdAt && (
                      <div className="flex justify-center my-6">
                        <span className="text-[10px] bg-background/40 backdrop-blur-sm border border-white/30 text-stone-500 px-3 py-1 rounded-full shadow-sm">
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

      {/* Input Area - Floating Glass */}
      <div className="bg-background/60 backdrop-blur-xl border-t border-white/40 p-3 pb-safe-area sticky bottom-0 z-20 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.02)]">
        {!canSendMessage ? (
          <div className="p-3 bg-stone-100/50 border border-stone-200/50 rounded-lg text-center text-sm text-stone-500 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            {t("chat.sessionEnded")}
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
                  className="shrink-0 rounded-full text-stone-500 hover:text-emerald-700 hover:bg-emerald-50"
                  title={t("chat.tagItems")}
                >
                  <Hash className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="top"
                className="w-80 p-0 overflow-hidden border-stone-200/60 bg-background/90 backdrop-blur-xl shadow-xl shadow-stone-900/5"
                sideOffset={10}
              >
                <div className="bg-emerald-50/50 px-4 py-2 border-b border-emerald-100/50">
                  <h4 className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-2">
                    <Leaf className="w-3 h-3" />
                    {t("chat.quickTag")}
                  </h4>
                </div>
                <Tabs defaultValue="menu" className="w-full">
                  <TabsList className="w-full rounded-none border-b border-stone-100  p-0 h-10">
                    <TabsTrigger value="menu">{t("chat.menu")}</TabsTrigger>
                    <TabsTrigger value="services">
                      {t("chat.services")}
                    </TabsTrigger>
                  </TabsList>

                  <div className="h-64 bg-background/40">
                    <TabsContent value="menu" className="h-full mt-0">
                      {isLoadingItems ? (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                        </div>
                      ) : (
                        <ScrollArea className="h-full">
                          {menuItems && menuItems.length > 0 ? (
                            <div className="p-1">
                              {menuItems.map((item) => (
                                <button
                                  key={item.itemId}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-emerald-50/60 rounded-md transition-colors group"
                                  onClick={() => handleTagItem(item, "menu")}
                                >
                                  <div className="font-medium text-sm text-stone-700 group-hover:text-emerald-800 transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="flex justify-between items-center mt-0.5">
                                    <span className="text-xs text-stone-500 line-clamp-1 max-w-[180px]">
                                      {item.description || "Không có mô tả"}
                                    </span>
                                    <span className="text-xs font-mono text-emerald-700 font-medium">
                                      {item.price?.toLocaleString()}đ
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                              <CloudFog className="h-6 w-6 opacity-50" />
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
                                className="w-full text-left px-3 py-2 hover:bg-emerald-50/60 rounded-md transition-colors group"
                                onClick={() => handleTagItem(item, "service")}
                              >
                                <div className="font-medium text-sm text-stone-700 group-hover:text-emerald-800 transition-colors">
                                  {item.name}
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                  <span className="text-xs text-stone-500 line-clamp-1 max-w-[180px]">
                                    {item.description || "Không có mô tả"}
                                  </span>
                                  <span className="text-xs font-mono text-emerald-700 font-medium">
                                    {item.basePrice?.toLocaleString()}đ
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                            <MapIcon className="h-6 w-6 opacity-50" />
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
                placeholder="Message reception..."
                disabled={isConnecting}
                className="pr-10 rounded-full bg-stone-100/50 border-transparent focus-visible:bg-background focus-visible:ring-emerald-500/20 focus-visible:border-emerald-200 transition-all text-stone-800 placeholder:text-stone-400"
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              size="icon"
              className="rounded-full shrink-0 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:scale-105 active:scale-95"
              disabled={!inputMessage.trim() || !isConnected}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white/80" />
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
