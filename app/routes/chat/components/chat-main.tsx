// 1. External Imports
import {
  Check,
  CheckCheck,
  CloudFog,
  Globe,
  Hash,
  Languages,
  Leaf,
  Loader2,
  Send,
  TreePalm,
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
import { cn, formatMoney } from "~/lib/utils";

interface ChatMainProps {
  sessionId: string | null;
}
export const BackgroundLayer = () => {
  const terracePattern = `data:image/svg+xml,%3Csvg width='100' height='60' viewBox='0 0 100 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q 25 10 50 30 T 100 30' fill='none' stroke='black' stroke-width='1.5'/%3E%3C/svg%3E`;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* 1. Base Background Color */}
      <div className="absolute inset-0 bg-stone-50 dark:bg-zinc-950 transition-colors duration-500" />

      {/* 2. Terrace Pattern Layer */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          maskImage: `url("${terracePattern}")`,
          WebkitMaskImage: `url("${terracePattern}")`,
          maskSize: "200px 120px",
          WebkitMaskSize: "200px 120px",
        }}
      >
        <div className="absolute inset-0 bg-emerald-800/10 dark:bg-emerald-400/10" />
      </div>

      {/* 3. The "Mist" Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-transparent to-stone-100/80 dark:from-emerald-950/20 dark:via-transparent dark:to-zinc-950/90" />

      {/* 4. Subtle Ambient Light */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl opacity-50" />
    </div>
  );
};

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
    sessionId: sessionId,
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

    if (
      !lastMessage ||
      lastMessage.sender !== "Guest" ||
      lastMessage.detectedLanguage
    ) {
      return;
    }

    const processGuestMessage = async () => {
      try {
        const detection = await TranslationService.detectLanguage(
          lastMessage.message
        );
        const detectedLang = detection?.language;

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
      onSuccess: () => toast.success("Marked all messages as read"),
      onError: () => toast.error("Could not mark as read"),
    });
  }, [sessionId, markAllReadMutation]);

  const handleAssignStaff = useCallback(
    (staffId: string) => {
      if (!sessionId) return;
      assignStaffMutation.mutate({ sessionId, staffUserId: staffId });
    },
    [sessionId, assignStaffMutation]
  );

  const handleTagItem = useCallback((item: any, type: "menu" | "service") => {
    const tag = type === "menu" ? `${item.name}` : `${item.name}`;
    setInputMessage((prev) => `${prev} ${tag}`.trim());
    setIsItemPopoverOpen(false);
    const input = document.getElementById("chat-input");
    input?.focus();
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
        toast.info("No translation needed (languages match or unsupported)");
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

      toast.success("Message translated successfully");
    } catch (error) {
      console.error("Input translation error:", error);
      toast.error("Could not translate message");
      setTranslationState((prev) => ({ ...prev, isTranslating: false }));
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user?.id) {
      toast.error("Please log in again");
      return;
    }

    try {
      const messageToSend =
        translationState.translatedText || inputMessage.trim();

      await sendMessageViaSignalR(messageToSend);

      setInputMessage("");
      setTranslationState({
        isTranslating: false,
        translatedText: "",
        sourceLang: null,
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {}
  };

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted relative overflow-hidden">
        <BackgroundLayer />
        <div className="text-center p-8 relative z-10 max-w-sm mx-4">
          <div className="w-20 h-20 rounded-full bg-muted border border-emerald-100 dark:border-emerald-900 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CloudFog className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="font-bold text-xl text-accent-foreground mb-2">
            Bắt đầu trò chuyện
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vui lòng chọn một phiên trò chuyện từ thanh bên để xem và phản hồi
            tin nhắn của khách hàng.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingSession || isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-50 dark:bg-zinc-950 relative">
        <BackgroundLayer />
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-500 mb-4" />
          <p className="text-stone-500 dark:text-stone-400 font-medium">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-zinc-950 relative">
        <BackgroundLayer />
        <div className="z-10 bg-background/80 dark:bg-background/90 p-6 rounded-2xl shadow-sm">
          Không tìm thấy phiên trò chuyện.
        </div>
      </div>
    );
  }

  const canSendMessage = session.state === "Open";

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col bg-stone-50 dark:bg-zinc-950 relative font-sans">
      <BackgroundLayer />

      <header className="flex items-center justify-between border-b border-white/20 dark:border-white/10 p-4 bg-background/70 dark:bg-background/80 backdrop-blur-xl shadow-sm shadow-stone-900/5 dark:shadow-black/20 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/50 dark:border-white/20 shadow-sm">
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 font-bold">
              {session.customerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-stone-800 dark:text-stone-100">
              {session.customerName}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <TreePalm className="w-3 h-3 text-stone-400 dark:text-stone-500" />
              Phòng {session.roomName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session.assignedStaffName && (
            <Badge
              variant="outline"
              className="bg-emerald-50/50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
            >
              <UserCheck className="h-3 w-3 mr-1" />
              {session.assignedStaffName}
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/50 rounded-full"
              >
                <Languages className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-background/95 dark:bg-background/98 backdrop-blur-xl border-white/50 dark:border-white/10 shadow-xl shadow-stone-900/10 dark:shadow-black/40"
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/50">
                  Ngôn ngữ dịch
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-background/95 dark:bg-background/98 backdrop-blur-xl">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setUserLanguage(lang.code)}
                        className={cn(
                          "cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/50 focus:text-emerald-800 dark:focus:text-emerald-300",
                          userLanguage === lang.code &&
                            "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium"
                        )}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.label}
                        {userLanguage === lang.code && (
                          <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator className="bg-stone-100 dark:bg-stone-800" />
              <div className="px-2 py-2 flex items-center justify-between">
                <Label
                  htmlFor="auto-translate"
                  className="text-sm cursor-pointer text-stone-600 dark:text-stone-300"
                >
                  Tự động dịch
                </Label>
                <Switch
                  id="auto-translate"
                  checked={autoTranslateEnabled}
                  onCheckedChange={setAutoTranslate}
                  className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
                />
              </div>
              <DropdownMenuSeparator className="bg-stone-100 dark:bg-stone-800" />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/50">
                  Giao cho nhân viên
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-background/95 dark:bg-background/98 backdrop-blur-xl">
                    {staffList?.length ? (
                      staffList.map((staff) => (
                        <DropdownMenuItem
                          key={staff.id}
                          onClick={() => handleAssignStaff(staff.id)}
                          disabled={assignStaffMutation.isPending}
                          className={cn(
                            "cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/50",
                            session.assignedStaffUserId === staff.id &&
                              "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
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
                            <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">
                              <Check className="h-4 w-4" />
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
              <DropdownMenuSeparator className="bg-stone-100 dark:bg-stone-800" />
              <DropdownMenuItem
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/50 focus:text-emerald-800 dark:focus:text-emerald-300"
              >
                <CheckCheck className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                Đánh dấu tất cả đã đọc
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative z-10">
        <ScrollArea className="h-full px-4 py-4" ref={scrollContainerRef}>
          <div className="space-y-4 pb-4">
            {isConnecting && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500 dark:text-emerald-400" />
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
                <div className="w-16 h-16 rounded-full bg-background/40 dark:bg-background/30 border border-white/60 dark:border-white/20 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-emerald-800/40 dark:text-emerald-400/40" />
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">
                  Chưa có tin nhắn nào.
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

      <div className="border-t border-white/20 dark:border-white/10 p-4 bg-background/70 dark:bg-background/80 backdrop-blur-xl shrink-0 z-20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.3)]">
        {!canSendMessage ? (
          <div className="text-center text-sm text-stone-500 dark:text-stone-400 py-2 flex items-center justify-center gap-2 bg-stone-100/50 dark:bg-stone-800/50 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-500"></span>
            Phiên đã đóng. Không thể gửi tin nhắn.
          </div>
        ) : (
          <div className="space-y-3">
            {translationState.translatedText && (
              <div className="bg-amber-50/80 dark:bg-amber-950/50 backdrop-blur-sm rounded-xl p-3 border border-amber-100 dark:border-amber-800 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-amber-800/60 dark:text-amber-300/60 mb-1">
                      Đang dịch ({translationState.sourceLang?.toUpperCase()}):
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 italic mb-1">
                      "{inputMessage}"
                    </p>
                    <div className="flex items-center gap-2 bg-background/50 dark:bg-background/30 rounded-lg p-2">
                      <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-100">
                        {translationState.translatedText}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-amber-100/50 dark:hover:bg-amber-900/50 text-amber-800/60 dark:text-amber-300/60 rounded-full"
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
                    variant="ghost"
                    size="icon"
                    className="rounded-full shrink-0 text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                    disabled={!isConnected}
                    title="Quick Tags"
                  >
                    <Hash className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-80 bg-background/95 dark:bg-background/98 backdrop-blur-xl border-white/50 dark:border-white/10 shadow-xl"
                >
                  <Tabs defaultValue="menu" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-stone-100/50 dark:bg-stone-800/50 p-1">
                      <TabsTrigger
                        value="menu"
                        className="data-[state=active]:bg-background data-[state=active]:text-emerald-800 dark:data-[state=active]:text-emerald-300 data-[state=active]:shadow-sm"
                      >
                        Menu
                      </TabsTrigger>
                      <TabsTrigger
                        value="services"
                        className="data-[state=active]:bg-background data-[state=active]:text-emerald-800 dark:data-[state=active]:text-emerald-300 data-[state=active]:shadow-sm"
                      >
                        Services
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="menu" className="mt-2">
                      <ScrollArea className="h-64">
                        {menuItems?.length ? (
                          <div className="space-y-1 p-1">
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
                          <div className="text-center py-8 text-sm text-stone-400 dark:text-stone-500">
                            Không tìm thấy món ăn
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="services" className="mt-2">
                      <ScrollArea className="h-64">
                        {serviceItems?.length ? (
                          <div className="space-y-1 p-1">
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
                          <div className="text-center py-8 text-sm text-stone-400 dark:text-stone-500">
                            Không tìm thấy dịch vụ
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>

              <div className="relative flex-1 group">
                <Input
                  id="chat-input"
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
                    isConnected ? "Type a message..." : "Connecting..."
                  }
                  disabled={!isConnected}
                  className="flex-1 rounded-full border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/50 focus-visible:bg-background focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-400 transition-all pr-10 pl-4 py-5 shadow-sm"
                />

                {inputMessage.trim() && !translationState.isTranslating && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0 text-stone-400 dark:text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                    onClick={handleDetectAndTranslateInput}
                    title="Translate before sending"
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                )}
                {translationState.isTranslating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500 dark:text-emerald-400" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                size="icon"
                className="rounded-full shrink-0 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/50 hover:scale-105 transition-all"
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
    className="w-full justify-start text-left h-auto py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 group rounded-xl"
    onClick={onClick}
  >
    <div className="flex flex-col items-start w-full">
      <span className="font-medium truncate w-full text-stone-700 dark:text-stone-200 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
        {name}
      </span>
      {description && (
        <span className="text-xs text-stone-400 dark:text-stone-500 line-clamp-1">
          {description}
        </span>
      )}
      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
        {formatMoney(price || 0).vndFormatted}
      </span>
    </div>
  </Button>
);
