import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Loader2,
  Languages,
  Globe,
  Check,
  CheckCheck,
  Leaf,
  CloudFog,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type { ChatMessage } from "~/lib/signalr";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface MessageBubbleProps {
  message: ChatMessage;
  onTranslate?: (message: ChatMessage) => void;
  isGuest?: boolean;
}

export function MessageBubble({
  message,
  onTranslate,
  isGuest = false,
}: MessageBubbleProps) {
  const isStaff = message.sender === "Staff";
  const isSystem = message.sender === "System";
  // Determine if the message is from the current user view
  const isOwnMessage = isGuest
    ? message.sender === "Guest"
    : message.sender === "Staff";

  // --- SYSTEM MESSAGE: Misty Pill ---
  if (isSystem) {
    return (
      <div className="flex justify-center my-6">
        <div className="bg-stone-200/50 backdrop-blur-sm border border-stone-200/50 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
          <CloudFog className="w-3 h-3 text-stone-500" />
          <p className="text-xs font-medium text-stone-600">
            {message.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end gap-3 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {/* --- AVATAR (Left / Incoming) --- */}
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 border border-white/60 shadow-sm bg-stone-100">
          <AvatarFallback className="bg-stone-200 text-stone-600 text-xs font-serif">
            {isStaff ? message.staffName?.[0] || "S" : "K"}
          </AvatarFallback>
        </Avatar>
      )}

      {/* --- MESSAGE BUBBLE CONTAINER --- */}
      <div
        className={cn(
          "max-w-[80%] w-fit px-4 py-3 shadow-sm relative group transition-all",
          // Rounding: "Pebble" shape
          "rounded-2xl",
          isOwnMessage
            ? "bg-emerald-600 text-white rounded-br-sm shadow-emerald-900/10" // Own: Deep Forest Green
            : "bg-white/80 backdrop-blur-md border border-white/50 text-stone-800 rounded-bl-sm shadow-stone-900/5" // Incoming: Misty Glass
        )}
      >
        {/* Staff name (for group chats context) */}
        {isStaff && message.staffName && !isOwnMessage && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1 opacity-80 flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            {message.staffName}
          </p>
        )}

        {/* Message Content */}
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed font-normal">
          {message.translatedText && message.showTranslation
            ? message.translatedText
            : message.message}

          {/* Translation Indicator */}
          {message.translatedText && message.showTranslation && (
            <span
              className={cn(
                "ml-1.5 text-[10px] italic font-medium inline-flex items-center gap-0.5",
                isOwnMessage ? "text-emerald-200" : "text-emerald-600/70"
              )}
            >
              (đã dịch)
            </span>
          )}
        </div>

        {/* Detected Language Badge */}
        {message.detectedLanguage && !message.showTranslation && (
          <Badge
            variant="outline"
            className={cn(
              "mt-2 text-[10px] h-5 px-1.5 font-normal border",
              isOwnMessage
                ? "border-emerald-400/30 text-emerald-50 bg-emerald-700/30"
                : "border-stone-200 text-stone-500 bg-stone-50/50"
            )}
          >
            <Globe className="h-2.5 w-2.5 mr-1 opacity-70" />
            {message.detectedLanguage.toUpperCase()}
          </Badge>
        )}

        {/* --- FOOTER: Timestamp & Actions --- */}
        <div
          className={cn(
            "flex items-center justify-between mt-1.5 gap-3",
            isOwnMessage ? "text-emerald-100/80" : "text-stone-400"
          )}
        >
          <div className="flex items-center gap-1.5">
            {/* Timestamp */}
            <p className="text-[10px] font-medium tracking-wide">
              {format(parseISO(message.createdAt ?? ""), "HH:mm", {
                locale: vi,
              })}
            </p>

            {/* Read Receipt (Only for own messages) */}
            {isStaff && isOwnMessage && (
              <div
                className="flex items-center transition-colors"
                title={
                  message.isRead && message.readAt
                    ? `Đã đọc lúc ${format(parseISO(message.readAt), "HH:mm dd/MM/yyyy", { locale: vi })}`
                    : "Đã gửi"
                }
              >
                {message.isRead ? (
                  <CheckCheck className="h-3 w-3 text-emerald-200" />
                ) : (
                  <Check className="h-3 w-3 text-emerald-400/70" />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Translate Button */}
            {!isSystem && onTranslate && (
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "h-5 px-1.5 py-0 rounded-full transition-colors",
                  isOwnMessage
                    ? "hover:bg-emerald-500/50 text-emerald-100 hover:text-white"
                    : "hover:bg-stone-100 text-stone-400 hover:text-emerald-700"
                )}
                onClick={() => onTranslate(message)}
                disabled={message.isTranslating}
              >
                {message.isTranslating ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ) : (
                  <>
                    <Languages className="h-3 w-3 mr-1" />
                    <span className="text-[10px] font-medium">
                      {message.showTranslation ? "Gốc" : "Dịch"}
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- AVATAR (Right / Own) --- */}
      {isOwnMessage && (
        <Avatar className="h-8 w-8 border border-white/60 shadow-sm bg-emerald-50">
          <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
            {isGuest ? "B" : message.staffName?.[0] || "S"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
