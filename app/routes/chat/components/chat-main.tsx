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
export const BackgroundLayer = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-stone-50/50">
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 C 20 10 40 10 50 0 C 60 10 80 10 100 0' fill='none' stroke='%23064e3b' stroke-width='2'/%3E%3Cpath d='M0 20 C 20 30 40 30 50 20 C 60 30 80 30 100 20' fill='none' stroke='%23064e3b' stroke-width='2'/%3E%3Cpath d='M0 40 C 20 50 40 50 50 40 C 60 50 80 50 100 40' fill='none' stroke='%23064e3b' stroke-width='2'/%3E%3C/svg%3E")`,
        backgroundSize: "400px 400px",
      }}
    ></div>
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/20 via-transparent to-white/60"></div>
  </div>
);
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
      onSuccess: () => toast.success("Marked all messages as read"),
      onError: () => toast.error("Could not mark as read"),
    });
  }, [sessionId, markAllReadMutation]);

  const handleCloseSession = useCallback(() => {
    if (!sessionId) return;
    closeSessionMutation.mutate(sessionId, {
      onSuccess: () => toast.success("Session closed"),
      onError: () => toast.error("Could not close session"),
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
    const tag = type === "menu" ? `#item:${item.name}` : `#svc:${item.name}`;
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
    } catch (error) {}
  };

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-50 relative overflow-hidden">
        <BackgroundLayer />
        <div className="text-center p-8 relative z-10  max-w-sm mx-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CloudFog className="h-10 w-10 text-emerald-800/40" />
          </div>
          <p className=" font-bold text-xl text-stone-800 mb-2">
            Bắt đầu trò chuyện
          </p>
          <p className="text-sm text-stone-500 leading-relaxed">
            Vui lòng chọn một phiên trò chuyện từ thanh bên để xem và phản hồi
            tin nhắn của khách hàng.
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingSession || isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-stone-50 relative">
        <BackgroundLayer />
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
          <p className="text-stone-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-stone-500 bg-stone-50 relative">
        <BackgroundLayer />
        <div className="z-10 bg-white/80 p-6 rounded-2xl shadow-sm">
          Session not found
        </div>
      </div>
    );
  }

  const canSendMessage = session.state === "Open";

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex flex-col bg-stone-50 relative font-sans">
      <BackgroundLayer />

      {/* 1. Header (Glassmorphic) */}
      <div className="flex items-center justify-between border-b border-white/20 p-4 bg-white/70 backdrop-blur-xl shadow-sm shadow-stone-900/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/50 shadow-sm">
            <AvatarFallback className="bg-emerald-100 text-emerald-800  font-bold">
              {session.customerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-stone-800">{session.customerName}</h2>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <TreePalm className="w-3 h-3 text-stone-400" />
              Room {session.roomName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session.assignedStaffName && (
            <Badge
              variant="outline"
              className="bg-emerald-50/50 text-emerald-700 border-emerald-200"
            >
              <UserCheck className="h-3 w-3 mr-1" />
              {session.assignedStaffName}
            </Badge>
          )}

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-stone-500 hover:text-emerald-800 hover:bg-emerald-50/50 rounded-full"
              >
                <Languages className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-white/95 backdrop-blur-xl border-white/50 shadow-xl shadow-stone-900/10"
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer focus:bg-emerald-50">
                  Ngôn ngữ dịch
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-white/95 backdrop-blur-xl">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setUserLanguage(lang.code)}
                        className={cn(
                          "cursor-pointer focus:bg-emerald-50 focus:text-emerald-800",
                          userLanguage === lang.code &&
                            "bg-emerald-50 text-emerald-800 font-medium"
                        )}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.label}
                        {userLanguage === lang.code && (
                          <span className="ml-auto text-xs text-emerald-600">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator className="bg-stone-100" />
              <div className="px-2 py-2 flex items-center justify-between">
                <Label
                  htmlFor="auto-translate"
                  className="text-sm cursor-pointer text-stone-600"
                >
                  Tự động dịch
                </Label>
                <Switch
                  id="auto-translate"
                  checked={autoTranslateEnabled}
                  onCheckedChange={setAutoTranslate}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
              <DropdownMenuSeparator className="bg-stone-100" />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer focus:bg-emerald-50">
                  Giao cho nhân viên
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-white/95 backdrop-blur-xl">
                    {staffList?.length ? (
                      staffList.map((staff) => (
                        <DropdownMenuItem
                          key={staff.id}
                          onClick={() => handleAssignStaff(staff.id)}
                          disabled={assignStaffMutation.isPending}
                          className={cn(
                            "cursor-pointer focus:bg-emerald-50",
                            session.assignedStaffUserId === staff.id &&
                              "bg-emerald-50 text-emerald-800"
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
                            <span className="ml-auto text-xs text-emerald-600">
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
              <DropdownMenuSeparator className="bg-stone-100" />
              <DropdownMenuItem
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-800"
              >
                <CheckCheck className="h-4 w-4 mr-2 text-emerald-600" /> Đánh
                dấu tất cả đã đọc
              </DropdownMenuItem>
              {canSendMessage && (
                <>
                  <DropdownMenuSeparator className="bg-stone-100" />
                  <DropdownMenuItem
                    onClick={handleCloseSession}
                    disabled={closeSessionMutation.isPending}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Đóng phiên
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Messages Area */}
      {/* Background is transparent to show the topographic pattern */}
      <div className="flex-1 overflow-hidden relative z-10">
        <ScrollArea className="h-full px-4 py-4" ref={scrollContainerRef}>
          <div className="space-y-4 pb-4">
            {isConnecting && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
                <div className="w-16 h-16 rounded-full bg-white/40 border border-white/60 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-emerald-800/40" />
                </div>
                <p className="text-sm text-stone-500 font-medium">
                  Quiet in the valley. <br /> No messages yet.
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

      {/* 3. Input Area (Floating/Glass) */}
      <div className="border-t border-white/20 p-4 bg-white/70 backdrop-blur-xl shrink-0 z-20 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
        {!canSendMessage ? (
          <div className="text-center text-sm text-stone-500 py-2 flex items-center justify-center gap-2 bg-stone-100/50 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-stone-400"></span>
            Session Closed
          </div>
        ) : (
          <div className="space-y-3">
            {/* Translation Preview - "Parchment Note" Style */}
            {translationState.translatedText && (
              <div className="bg-amber-50/80 backdrop-blur-sm rounded-xl p-3 border border-amber-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-amber-800/60 mb-1">
                      Translating ({translationState.sourceLang?.toUpperCase()}
                      ):
                    </p>
                    <p className="text-xs text-stone-500 line-clamp-1 italic mb-1">
                      "{inputMessage}"
                    </p>
                    <div className="flex items-center gap-2 bg-white/50 rounded-lg p-2">
                      <Globe className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="text-sm font-medium text-stone-800">
                        {translationState.translatedText}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-amber-100/50 text-amber-800/60 rounded-full"
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
                    variant="ghost"
                    size="icon"
                    className="rounded-full shrink-0 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50"
                    disabled={!isConnected}
                    title="Quick Tags"
                  >
                    <Hash className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-80 bg-white/95 backdrop-blur-xl border-white/50 shadow-xl"
                >
                  <Tabs defaultValue="menu" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-stone-100/50 p-1">
                      <TabsTrigger
                        value="menu"
                        className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
                      >
                        Menu
                      </TabsTrigger>
                      <TabsTrigger
                        value="services"
                        className="data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
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
                          <div className="text-center py-8 text-sm text-stone-400">
                            No menu items found
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
                          <div className="text-center py-8 text-sm text-stone-400">
                            No services found
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>

              <div className="relative flex-1 group">
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
                    isConnected ? "Type a message..." : "Connecting..."
                  }
                  disabled={!isConnected}
                  className="flex-1 rounded-full border-stone-200 bg-stone-50/50 focus-visible:bg-white focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-all pr-10 pl-4 py-5 shadow-sm"
                />

                {/* Translate Trigger Inside Input (Optional UX improvement) */}
                {inputMessage.trim() && !translationState.isTranslating && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50"
                    onClick={handleDetectAndTranslateInput}
                    title="Translate before sending"
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                )}
                {translationState.isTranslating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                size="icon"
                className="rounded-full shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 hover:scale-105 transition-all"
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

// Helper Component for the Popover List Items
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
    className="w-full justify-start text-left h-auto py-2 hover:bg-emerald-50 group rounded-xl"
    onClick={onClick}
  >
    <div className="flex flex-col items-start w-full">
      <span className="font-medium truncate w-full text-stone-700 group-hover:text-emerald-800 transition-colors">
        {name}
      </span>
      {description && (
        <span className="text-xs text-stone-400 line-clamp-1">
          {description}
        </span>
      )}
      <span className="text-xs text-emerald-600 font-mono mt-0.5">
        {price?.toLocaleString("vi-VN")} VNĐ
      </span>
    </div>
  </Button>
);
