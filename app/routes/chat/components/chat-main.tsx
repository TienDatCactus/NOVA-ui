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
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
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
  useStaffList,
} from "../container/query.hooks";
import { useTranslateMessage } from "../container/translation.hooks";
import { TranslationService } from "~/services/api/translation";
import { MessageBubble } from "../fragments/message-bubble";
import { signalRChatService, type ChatMessage } from "~/lib/signalr";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useAuthStore } from "~/store/auth.store";
import { useChatTranslationStore } from "~/store/chat-translation.store";
import { SUPPORTED_LANGUAGES } from "~/lib/constants";

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
    sessionLanguageOverrides,
    setUserLanguage,
    setAutoTranslate,
    setSessionLanguage,
  } = useChatTranslationStore();
  const { translateMessage, autoTranslateMessage } = useTranslateMessage();

  // Get effective language for this session (session override or global)
  const effectiveLanguage = sessionId
    ? sessionLanguageOverrides[sessionId] || userLanguage
    : userLanguage;

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === effectiveLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const { data: session, isLoading: isLoadingSession } = useChatSession(
    sessionId || "",
    !!sessionId
  );
  const { data: messageHistory, isLoading: isLoadingMessages } =
    useChatMessages(sessionId || "", !!sessionId);
  const { data: staffList } = useStaffList();

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

              // Auto-translate if enabled
              if (
                autoTranslateEnabled &&
                detectedLang &&
                detectedLang !== effectiveLanguage
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

  // Auto-scroll to bottom (only for new messages, not translation toggles)
  const prevMessageCountRef = useRef(messages.length);
  useEffect(() => {
    // Only scroll if message count increased (new message arrived)
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = messages.length;
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

  // Detect language and translate input message before sending
  const [isTranslatingInput, setIsTranslatingInput] = useState(false);
  const [translatedInput, setTranslatedInput] = useState("");
  const [inputSourceLang, setInputSourceLang] = useState<string | null>(null);

  const handleDetectAndTranslateInput = async () => {
    if (!inputMessage.trim()) return;

    setIsTranslatingInput(true);
    try {
      // Detect language of input
      const detection = await TranslationService.detectLanguage(inputMessage);
      const detectedLang = detection?.language;

      if (!detectedLang) {
        toast.error("Không thể nhận diện ngôn ngữ");
        setIsTranslatingInput(false);
        return;
      }

      setInputSourceLang(detectedLang);

      // Get the guest's language (from latest guest message or session override)
      const guestMessages = messages.filter((m) => m.sender === "Guest");
      const latestGuestMessage = guestMessages[guestMessages.length - 1];
      const targetLang =
        latestGuestMessage?.detectedLanguage || effectiveLanguage;

      // If same language, no need to translate
      if (detectedLang === targetLang) {
        toast.info("Tin nhắn đã ở ngôn ngữ của khách");
        setIsTranslatingInput(false);
        return;
      }

      // Translate to guest's language
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

  const canSendMessage = session.state === "Open";

  return (
    <div className="flex-1 flex flex-col bg-background">
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
                    {staffList && staffList.data.length > 0 ? (
                      staffList.data.map((staff) => (
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
                            <span className="font-medium">
                              {staff.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {staff.staffRoleName}
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
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
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
