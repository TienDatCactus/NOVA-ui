// 1. External Imports
import {
  Check,
  CheckCheck,
  Globe,
  Hash,
  Languages,
  Loader2,
  Send,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// 2. UI Component Imports
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
import { ScrollArea } from "~/components/ui/scroll-area";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// 3. Local Components & Fragments
import { MessageBubble } from "../fragments/message-bubble";

// 4. Hooks, Stores & Services
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useServices } from "~/routes/services/container/services/query.hooks";
import { useChatStaff } from "~/routes/users/container/query.hooks";
import { TranslationService } from "~/services/api/translation";
import { useAuthStore } from "~/store/auth.store";
import { useChatTranslationStore } from "~/store/chat-translation.store";
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
import { useChatConnection } from "../container/use-chat-connection.hooks";

// 5. Utils & Types
import { SUPPORTED_LANGUAGES } from "~/lib/constants";
import type { ChatMessage } from "~/lib/signalr";
import { cn } from "~/lib/utils";

interface ChatMainProps {
  sessionId: string | null;
}

export function ChatMain({ sessionId }: ChatMainProps) {
  // --- Refs & State ---
  const user = useAuthStore((s) => s.user);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState("");

  // Consolidated translation state to reduce re-renders
  const [translationState, setTranslationState] = useState<{
    isTranslating: boolean;
    translatedText: string;
    sourceLang: string | null;
  }>({
    isTranslating: false,
    translatedText: "",
    sourceLang: null,
  });

  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState(false);

  // --- Store & Hooks ---
  const {
    userLanguage,
    autoTranslateEnabled,
    sessionLanguageOverrides,
    setUserLanguage,
    setAutoTranslate,
  } = useChatTranslationStore();

  const { translateMessage, autoTranslateMessage } = useTranslateMessage();

  const effectiveLanguage = useMemo(
    () =>
      sessionId
        ? sessionLanguageOverrides[sessionId] || userLanguage
        : userLanguage,
    [sessionId, sessionLanguageOverrides, userLanguage]
  );

  // --- Data Fetching ---
  const { data: session, isLoading: isLoadingSession } = useChatSession(
    sessionId || "",
    !!sessionId
  );
  const { data: messageHistory, isLoading: isLoadingMessages } =
    useChatMessages(sessionId || "", !!sessionId);

  const { data: staffList } = useChatStaff();
  const { data: menuItems } = useMenuList({});
  const { data: serviceItems } = useServices({});

  const assignStaffMutation = useAssignStaff();
  const closeSessionMutation = useCloseSession();
  const markAllReadMutation = useMarkAllRead();

  // --- SignalR Connection ---
  const {
    messages,
    isConnecting,
    isConnected,
    updateMessage,
    sendMessage: sendMessageViaSignalR,
    loadMessages,
  } = useChatConnection({
    sessionId: sessionId, // Don't fallback to "" - let hook handle null
    isGuest: false,
    userId: user?.id,
  });

  // --- Effects ---

  // 1. Load History
  useEffect(() => {
    if (messageHistory) {
      loadMessages(messageHistory as ChatMessage[]);
    }
  }, [messageHistory, loadMessages]);

  // 2. Auto-translate Guest Messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Guard clause: Exit early if condition not met
    if (
      !lastMessage ||
      lastMessage.sender !== "Guest" ||
      lastMessage.detectedLanguage // Already processed
    ) {
      return;
    }

    const processGuestMessage = async () => {
      try {
        const detection = await TranslationService.detectLanguage(
          lastMessage.message
        );
        const detectedLang = detection?.language;

        // Optimistic update for detection
        updateMessage(lastMessage.id, { detectedLanguage: detectedLang });

        if (
          autoTranslateEnabled &&
          shouldTranslate(detectedLang, effectiveLanguage)
        ) {
          const translatedMessage = await autoTranslateMessage({
            ...lastMessage,
            detectedLanguage: detectedLang,
          });

          updateMessage(lastMessage.id, {
            translatedText: translatedMessage.translatedText,
            showTranslation: true,
          });
        }
      } catch (error) {
        console.error("Auto-translation failed:", error);
      }
    };

    processGuestMessage();
  }, [
    messages,
    autoTranslateEnabled,
    effectiveLanguage,
    updateMessage,
    autoTranslateMessage,
  ]);

  // 3. Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- Handlers (Memoized) ---

  const handleTranslate = useCallback(
    (message: ChatMessage) => {
      translateMessage(message, updateMessage);
    },
    [translateMessage, updateMessage]
  );

  const handleMarkAllRead = useCallback(() => {
    if (!sessionId) return;
    markAllReadMutation.mutate(sessionId, {
      onSuccess: () => toast.success("Đã đánh dấu tất cả tin nhắn là đã đọc"),
      onError: () => toast.error("Không thể đánh dấu đã đọc"),
    });
  }, [sessionId, markAllReadMutation]);

  const handleCloseSession = useCallback(() => {
    if (!sessionId) return;
    closeSessionMutation.mutate(sessionId, {
      onSuccess: () => toast.success("Đã đóng phiên chat"),
      onError: () => toast.error("Không thể đóng phiên chat"),
    });
  }, [sessionId, closeSessionMutation]);

  const handleAssignStaff = useCallback(
    (staffId: string) => {
      if (!sessionId) return;
      assignStaffMutation.mutate({ sessionId, staffUserId: staffId });
    },
    [sessionId, assignStaffMutation]
  );

  const handleTagItem = useCallback((item: any, type: "menu" | "service") => {
    const tag = type === "menu" ? `#món:${item.name}` : `#dv:${item.name}`;
    setInputMessage((prev) => `${prev} ${tag}`.trim());
    setIsItemPopoverOpen(false);
  }, []);

  const handleDetectAndTranslateInput = async () => {
    if (!inputMessage.trim()) return;

    setTranslationState((prev) => ({ ...prev, isTranslating: true }));

    try {
      const detection = await TranslationService.detectLanguage(inputMessage);
      const detectedLang = detection?.language;

      if (!detectedLang) throw new Error("Could not detect language");

      const guestMessages = messages.filter((m) => m.sender === "Guest");
      const targetLang =
        guestMessages[guestMessages.length - 1]?.detectedLanguage ||
        effectiveLanguage;

      if (!shouldTranslate(detectedLang, targetLang)) {
        toast.info("Không cần dịch (ngôn ngữ trùng khớp hoặc không hỗ trợ)");
        return;
      }

      const result = await TranslationService.translateText({
        text: inputMessage,
        sourceLanguage: detectedLang,
        targetLanguage: targetLang,
      });

      setTranslationState({
        isTranslating: false,
        translatedText: result.translatedText,
        sourceLang: detectedLang,
      });

      toast.success("Dịch tin nhắn thành công");
    } catch (error) {
      console.error("Input translation error:", error);
      toast.error("Không thể dịch tin nhắn");
      setTranslationState((prev) => ({ ...prev, isTranslating: false }));
    }
  };

  const handleSendMessage = async () => {
    console.group("[Staff Chat] handleSendMessage");
    console.log("Input Message:", inputMessage);
    console.log("User Object:", user);
    console.log("User ID:", user?.id);
    console.log("Session ID:", sessionId);
    console.log("Translation State:", translationState);
    console.groupEnd();

    if (!inputMessage.trim() || !user?.id) {
      console.warn("[Staff Chat] Validation failed:", {
        hasInput: !!inputMessage.trim(),
        hasUserId: !!user?.id,
        user: user,
      });
      toast.error("Vui lòng đăng nhập lại");
      return;
    }

    try {
      const messageToSend =
        translationState.translatedText || inputMessage.trim();

      console.log("[Staff Chat] Sending message:", {
        original: inputMessage,
        translated: translationState.translatedText || "(none)",
        final: messageToSend,
        userId: user.id,
        sessionId,
      });

      await sendMessageViaSignalR(messageToSend);

      console.log("[Staff Chat] ✅ Message sent, clearing state");

      // Clear input after successful send
      setInputMessage("");
      setTranslationState({
        isTranslating: false,
        translatedText: "",
        sourceLang: null,
      });

      // Force scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.group("[Staff Chat] ❌ Send Message Error");
      console.error("Error object:", error);
      console.error(
        "Error type:",
        error instanceof Error ? error.constructor.name : typeof error
      );
      console.error(
        "Error message:",
        error instanceof Error ? error.message : String(error)
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : undefined
      );
      console.error("Context at error:", {
        inputMessage,
        messageToSend: translationState.translatedText || inputMessage.trim(),
        user: user,
        userId: user?.id,
        sessionId,
        translationState,
      });
      console.groupEnd();
    }
  };

  // --- Render Helpers ---

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium mb-1">Chọn cuộc trò chuyện</p>
          <p className="text-sm text-muted-foreground">
            Bắt đầu từ danh sách bên trái
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
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Không tìm thấy phiên chat
      </div>
    );
  }

  const canSendMessage = session.state === "Open";

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col bg-background">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b p-4 bg-white shadow-sm shrink-0">
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

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Languages className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
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
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <div className="px-2 py-2 flex items-center justify-between">
                <Label
                  htmlFor="auto-translate"
                  className="text-sm cursor-pointer"
                >
                  Tự động dịch
                </Label>
                <Switch
                  id="auto-translate"
                  checked={autoTranslateEnabled}
                  onCheckedChange={setAutoTranslate}
                />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Gán nhân viên</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {staffList?.length ? (
                      staffList.map((staff) => (
                        <DropdownMenuItem
                          key={staff.id}
                          onClick={() => handleAssignStaff(staff.id)}
                          disabled={assignStaffMutation.isPending}
                          className={cn(
                            session.assignedStaffUserId === staff.id &&
                              "bg-muted"
                          )}
                        >
                          <div className="flex flex-col flex-1">
                            <span className="font-medium">
                              {staff.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {staff.email}
                            </span>
                          </div>
                          {session.assignedStaffUserId === staff.id && (
                            <span className="ml-auto text-xs text-primary">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        Không có dữ liệu
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" /> Đánh dấu đã đọc
              </DropdownMenuItem>
              {canSendMessage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleCloseSession}
                    disabled={closeSessionMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Đóng phiên chat
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Messages Area */}
      <div className="flex-1 overflow-hidden relative bg-muted/30">
        <ScrollArea className="h-full px-4 py-4" ref={scrollContainerRef}>
          <div className="space-y-4 pb-4">
            {isConnecting && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
                <Send className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Chưa có tin nhắn nào trong cuộc trò chuyện này.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onTranslate={handleTranslate}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* 3. Input Area */}
      <div className="border-t p-4 bg-white shrink-0">
        {!canSendMessage ? (
          <div className="text-center text-sm text-muted-foreground py-2">
            Phiên chat đã đóng
          </div>
        ) : (
          <div className="space-y-2">
            {/* Translation Preview */}
            {translationState.translatedText && (
              <div className="bg-muted/50 rounded-md p-3 border border-border animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Gốc ({translationState.sourceLang?.toUpperCase()}):{" "}
                      <span className="text-foreground">{inputMessage}</span>
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3 text-primary" />
                      <p className="text-sm font-medium">
                        {translationState.translatedText}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setTranslationState((prev) => ({
                        ...prev,
                        translatedText: "",
                        sourceLang: null,
                      }))
                    }
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
                    className="rounded-full shrink-0"
                    disabled={!isConnected}
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
                      <ScrollArea className="h-64">
                        {menuItems?.length ? (
                          <div className="space-y-1">
                            {menuItems.map((item) => (
                              <TagItemButton
                                key={item.itemId}
                                name={item.name}
                                description={item.description ?? ""}
                                price={item.price}
                                onClick={() => handleTagItem(item, "menu")}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            Không có dữ liệu
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="services" className="mt-2">
                      <ScrollArea className="h-64">
                        {serviceItems?.length ? (
                          <div className="space-y-1">
                            {serviceItems.map((item) => (
                              <TagItemButton
                                key={item.serviceItemId}
                                name={item.name}
                                description={item.description}
                                price={item.basePrice}
                                onClick={() => handleTagItem(item, "service")}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            Không có dữ liệu
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>

              <Input
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  if (translationState.translatedText) {
                    setTranslationState((prev) => ({
                      ...prev,
                      translatedText: "",
                      sourceLang: null,
                    }));
                  }
                }}
                placeholder={
                  isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."
                }
                disabled={!isConnected}
                className="flex-1 rounded-full"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full shrink-0"
                onClick={handleDetectAndTranslateInput}
                disabled={
                  !inputMessage.trim() ||
                  translationState.isTranslating ||
                  !isConnected
                }
              >
                {translationState.isTranslating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
              </Button>

              <Button
                type="submit"
                size="icon"
                className="rounded-full shrink-0"
                disabled={!inputMessage.trim() || !isConnected}
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

// Helper Component for the Popover List Items to keep the main render clean
const TagItemButton = ({
  name,
  description,
  price,
  onClick,
}: {
  name: string;
  description?: string;
  price?: number;
  onClick: () => void;
}) => (
  <Button
    variant="ghost"
    className="w-full justify-start text-left h-auto py-2"
    onClick={onClick}
  >
    <div className="flex flex-col items-start w-full">
      <span className="font-medium truncate w-full">{name}</span>
      {description && (
        <span className="text-xs text-muted-foreground line-clamp-1">
          {description}
        </span>
      )}
      <span className="text-xs text-primary">
        {price?.toLocaleString("vi-VN")} VNĐ
      </span>
    </div>
  </Button>
);
