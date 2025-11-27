import {
  Globe,
  Hash,
  Languages,
  Loader2,
  Send,
  UserCheck,
  XCircle,
  CheckCheck,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SUPPORTED_LANGUAGES } from "~/lib/constants";
import { signalRChatService, type ChatMessage } from "~/lib/signalr";
import { cn } from "~/lib/utils";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useServices } from "~/routes/services/container/services/query.hooks";
import { TranslationService } from "~/services/api/translation";
import { useAuthStore } from "~/store/auth.store";
import { useChatTranslationStore } from "~/store/chat-translation.store";
import { useVirtualizer } from "@tanstack/react-virtual";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";
import {
  useAssignStaff,
  useChatMessages,
  useChatSession,
  useCloseSession,
  useMarkAllRead,
} from "../container/query.hooks";
import {
  shouldTranslate,
  useTranslateMessage,
} from "../container/translation.hooks";
import { MessageBubble } from "../fragments/message-bubble";
import { useStaffList } from "~/routes/staff/staff/container/query.hooks";
import { useUsers } from "~/routes/users/container/useUsers.hooks";
import { ScrollArea } from "~/components/ui/scroll-area";

interface ChatMainProps {
  sessionId: string | null;
}

export function ChatMain({ sessionId }: ChatMainProps) {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Translation state
  const {
    userLanguage,
    autoTranslateEnabled,
    sessionLanguageOverrides,
    setUserLanguage,
    setAutoTranslate,
  } = useChatTranslationStore();
  const { translateMessage, autoTranslateMessage } = useTranslateMessage();

  const effectiveLanguage = sessionId
    ? sessionLanguageOverrides[sessionId] || userLanguage
    : userLanguage;

  const { data: session, isLoading: isLoadingSession } = useChatSession(
    sessionId || "",
    !!sessionId
  );
  const { data: messageHistory, isLoading: isLoadingMessages } =
    useChatMessages(sessionId || "", !!sessionId);
  const { data: staffList } = useUsers();

  const assignStaffMutation = useAssignStaff();
  const closeSessionMutation = useCloseSession();
  const markAllReadMutation = useMarkAllRead();

  // Connect to SignalR and join session
  useEffect(() => {
    if (!sessionId) return;

    const connectSignalR = async () => {
      setIsConnecting(true);
      try {
        await signalRChatService.connect(import.meta.env.VITE_CHAT_HUB_URL);
        await signalRChatService.joinSession(sessionId);
        signalRChatService.onReceiveMessage(async (message: ChatMessage) => {
          // Auto-detect language and translate guest messages if enabled
          if (message.sender === "Guest") {
            try {
              // Always detect language for guest messages
              const detection = await TranslationService.detectLanguage(
                message.message
              );
              const detectedLang = detection?.language;

              const messageWithDetection = {
                ...message,
                detectedLanguage: detectedLang,
              };

              // Auto-translate if enabled and translation is needed
              if (
                autoTranslateEnabled &&
                shouldTranslate(detectedLang, effectiveLanguage)
              ) {
                const translatedMessage =
                  await autoTranslateMessage(messageWithDetection);
                setMessages((prev) => {
                  if (prev.some((m) => m.id === translatedMessage.id))
                    return prev;
                  return [...prev, translatedMessage];
                });
              } else {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === messageWithDetection.id))
                    return prev;
                  return [...prev, messageWithDetection];
                });
              }
            } catch (error) {
              console.error("Language detection failed:", error);
              // Fallback to original message
              setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
              });
            }
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
        signalRChatService.leaveSession(sessionId).catch((error) => {
          console.error("Failed to leave session:", error);
        });
      }
      signalRChatService.offAll("ReceiveMessage");
    };
  }, [sessionId]);

  // Load initial messages
  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory as ChatMessage[]);
    }
  }, [messageHistory]);

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  // Scroll to bottom on new messages
  const prevMessageCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && virtualizer) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, virtualizer]);

  // Group messages by date for separators
  const messagesWithSeparators = useMemo(() => {
    const grouped: Array<{
      type: "message" | "separator";
      data: any;
      index: number;
    }> = [];
    let lastDate: string | null = null;

    messages.forEach((msg, index) => {
      // Skip messages without createdAt
      if (!msg.createdAt) {
        grouped.push({ type: "message", data: msg, index: grouped.length });
        return;
      }

      const msgDate = format(parseISO(msg.createdAt), "yyyy-MM-dd");

      if (msgDate !== lastDate) {
        // Add date separator
        const date = parseISO(msg.createdAt);
        let label: string;
        if (isToday(date)) {
          label = "Hôm nay";
        } else if (isYesterday(date)) {
          label = "Hôm qua";
        } else {
          label = format(date, "dd/MM/yyyy", { locale: vi });
        }
        grouped.push({ type: "separator", data: label, index: grouped.length });
        lastDate = msgDate;
      }

      grouped.push({ type: "message", data: msg, index: grouped.length });
    });

    return grouped;
  }, [messages]);

  const updateMessage = (messageId: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  const handleTranslate = (message: ChatMessage) => {
    translateMessage(message, updateMessage);
  };

  const handleMarkAllRead = () => {
    if (!sessionId) return;
    markAllReadMutation.mutate(sessionId, {
      onSuccess: () => {
        toast.success("Đã đánh dấu tất cả tin nhắn là đã đọc");
      },
      onError: () => {
        toast.error("Không thể đánh dấu đã đọc");
      },
    });
  };

  const [isTranslatingInput, setIsTranslatingInput] = useState(false);
  const [translatedInput, setTranslatedInput] = useState("");
  const [inputSourceLang, setInputSourceLang] = useState<string | null>(null);
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState(false);
  const { data: menuItems } = useMenuList({});
  const { data: serviceItems } = useServices({});
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const handleTagItem = (item: any, type: "menu" | "service") => {
    const tag = type === "menu" ? `#món:${item.name}` : `#dv:${item.name}`;
    setInputMessage((prev) => `${prev} ${tag}`.trim());
    setIsItemPopoverOpen(false);
  };

  const handleDetectAndTranslateInput = async () => {
    if (!inputMessage.trim()) return;

    setIsTranslatingInput(true);
    try {
      const detection = await TranslationService.detectLanguage(inputMessage);
      const detectedLang = detection?.language;

      if (!detectedLang) {
        toast.error("Không thể nhận diện ngôn ngữ");
        setIsTranslatingInput(false);
        return;
      }

      setInputSourceLang(detectedLang);

      const guestMessages = messages.filter((m) => m.sender === "Guest");
      const latestGuestMessage = guestMessages[guestMessages.length - 1];
      const targetLang =
        latestGuestMessage?.detectedLanguage || effectiveLanguage;

      // Check if translation is needed using shouldTranslate
      if (!shouldTranslate(detectedLang, targetLang)) {
        toast.info("Tin nhắn đã ở ngôn ngữ của khách hoặc không thể dịch");
        setIsTranslatingInput(false);
        return;
      }

      const result = await TranslationService.translateText({
        text: inputMessage,
        sourceLanguage: detectedLang,
        targetLanguage: targetLang,
      });

      setTranslatedInput(result.translatedText);

      const sourceLangLabel =
        SUPPORTED_LANGUAGES.find((l) => l.code === detectedLang)?.label ||
        detectedLang.toUpperCase();
      const targetLangLabel =
        SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.label ||
        targetLang.toUpperCase();

      toast.success(`Đã dịch từ ${sourceLangLabel} sang ${targetLangLabel}`);
    } catch (error) {
      console.error("Translation failed:", error);
      toast.error("Không thể dịch tin nhắn");
    } finally {
      setIsTranslatingInput(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || !user) return;

    try {
      // Send translated version if available, otherwise send original
      const messageToSend = translatedInput || inputMessage.trim();

      await signalRChatService.sendMessage({
        sessionId,
        message: messageToSend,
        sender: "Staff",
        staffUserId: user.id,
      });

      setInputMessage("");
      setTranslatedInput("");
      setInputSourceLang(null);
    } catch (error) {
      toast.error("Không thể gửi tin nhắn");
      console.error(error);
    }
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

  const canSendMessage = session.state === "Open";

  return (
    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b p-4 bg-white shadow-sm">
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

          {/* Unified Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Languages className="h-4 w-4 mr-2" />
                Cài đặt Chat
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* Language Selection */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Ngôn ngữ dịch đích
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setUserLanguage(lang.code)}
                        className={cn(userLanguage === lang.code && "bg-muted")}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.label}
                        {userLanguage === lang.code && (
                          <span className="ml-auto text-xs text-primary">
                            ✓
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Auto-translate Toggle */}
              <div className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="auto-translate-menu"
                    className="text-sm cursor-pointer"
                  >
                    Tự động dịch tin nhắn
                  </Label>
                  <Switch
                    id="auto-translate-menu"
                    checked={autoTranslateEnabled}
                    onCheckedChange={setAutoTranslate}
                  />
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Staff Assignment */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Gán nhân viên</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {staffList && staffList.length > 0 ? (
                      staffList.map((staff) => (
                        <DropdownMenuItem
                          key={staff.id}
                          onClick={() => {
                            if (!sessionId) return;
                            assignStaffMutation.mutate(
                              {
                                sessionId,
                                staffUserId: staff.id,
                              },
                              {
                                onSuccess: () => {
                                  toast.success(`Đã gán cho ${staff.fullName}`);
                                },
                                onError: () => {
                                  toast.error("Không thể gán nhân viên");
                                },
                              }
                            );
                          }}
                          className={cn(
                            session.assignedStaffUserId === staff.id &&
                              "bg-muted"
                          )}
                          disabled={assignStaffMutation.isPending}
                        >
                          <div className="flex flex-col flex-1">
                            <span className="font-medium">{staff.roles}</span>
                            <span className="text-xs text-muted-foreground">
                              {staff.email}
                            </span>
                          </div>
                          {session.assignedStaffUserId === staff.id && (
                            <span className="ml-auto text-xs text-primary">
                              ✓
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        Không có nhân viên
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Mark All Read */}
              <DropdownMenuItem
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Đánh dấu đã đọc
              </DropdownMenuItem>

              {canSendMessage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleCloseSession}
                    disabled={closeSessionMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Đóng phiên chat
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-muted/30"
        style={{ position: "relative" }}
      >
        {isConnecting && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = messagesWithSeparators[virtualItem.index];

            if (!item) return null;

            if (item.type === "separator") {
              return (
                <div
                  key={`separator-${virtualItem.index}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="flex justify-center my-4">
                    <div className="bg-muted px-4 py-1 rounded-full">
                      <p className="text-xs font-medium text-muted-foreground">
                        {item.data}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.data.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="pb-4"
              >
                <MessageBubble
                  message={item.data}
                  onTranslate={handleTranslate}
                />
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-white">
        {!canSendMessage ? (
          <div className="text-center text-sm text-muted-foreground py-2">
            Phiên chat đã đóng
          </div>
        ) : (
          <div className="space-y-2">
            {/* Translation Preview */}
            {translatedInput && (
              <div className="bg-muted/50 rounded-md p-3 border border-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Bản gốc ({inputSourceLang?.toUpperCase()}):
                    </p>
                    <p className="text-sm mb-2">{inputMessage}</p>
                    <p className="text-xs text-muted-foreground mb-1">
                      Bản dịch sẽ gửi:
                    </p>
                    <p className="text-sm font-medium">{translatedInput}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTranslatedInput("");
                      setInputSourceLang(null);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Input Form */}
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
                    className="rounded-full"
                    onClick={() => {
                      setIsItemPopoverOpen(true);
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
                      ) : menuItems && menuItems.length > 0 ? (
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
                                  <span className="font-medium">
                                    {item.name}
                                  </span>
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
                      ) : serviceItems && serviceItems.length > 0 ? (
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
                                  <span className="font-medium">
                                    {item.name}
                                  </span>
                                  {item.description && (
                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                      {item.description}
                                    </span>
                                  )}
                                  <span className="text-xs text-primary">
                                    {item.basePrice?.toLocaleString("vi-VN")}{" "}
                                    VNĐ
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
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  // Clear translation if user edits message
                  if (translatedInput) {
                    setTranslatedInput("");
                    setInputSourceLang(null);
                  }
                }}
                placeholder="Nhập tin nhắn..."
                disabled={isConnecting}
                className="flex-1 rounded-full"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleDetectAndTranslateInput}
                disabled={
                  !inputMessage.trim() || isTranslatingInput || isConnecting
                }
                title="Dịch tin nhắn sang ngôn ngữ của khách"
              >
                {isTranslatingInput ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="submit"
                size="icon"
                className="rounded-full"
                disabled={!inputMessage.trim() || isConnecting}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
