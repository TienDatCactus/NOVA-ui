import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Loader2, Languages, Globe, Check, CheckCheck } from "lucide-react";
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
  const isOwnMessage = isGuest
    ? message.sender === "Guest"
    : message.sender === "Staff";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted px-4 py-2 rounded-full">
          <p className="text-xs text-muted-foreground">{message.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {isStaff ? message.staffName?.[0] || "S" : "K"}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3",
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-muted rounded-bl-none"
        )}
      >
        {/* Staff name (for staff messages from other staff) */}
        {isStaff && message.staffName && !isOwnMessage && (
          <p className="text-xs font-semibold mb-1 opacity-90">
            {message.staffName}
          </p>
        )}

        {/* Original message text */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.message}
        </p>

        {/* Detected language badge */}
        {message.detectedLanguage && !message.showTranslation && (
          <Badge
            variant="outline"
            className={cn(
              "mt-2 text-xs",
              isOwnMessage
                ? "border-primary-foreground/30 text-primary-foreground"
                : "border-muted-foreground/30"
            )}
          >
            <Globe className="h-3 w-3 mr-1" />
            {message.detectedLanguage.toUpperCase()}
          </Badge>
        )}

        {/* Translation section */}
        {message.translatedText && message.showTranslation && (
          <div
            className={cn(
              "mt-2 pt-2 border-t",
              isOwnMessage
                ? "border-primary-foreground/20"
                : "border-muted-foreground/20"
            )}
          >
            <p
              className={cn(
                "text-xs mb-1",
                isOwnMessage ? "opacity-70" : "text-muted-foreground"
              )}
            >
              Đã dịch từ {message.detectedLanguage || "ngôn ngữ khác"}
            </p>
            <p className="text-sm whitespace-pre-wrap break-words opacity-90">
              {message.translatedText}
            </p>
          </div>
        )}

        {/* Footer: timestamp + read status + action buttons */}
        <div className="flex items-center justify-between mt-1 gap-2">
          <div className="flex items-center gap-1">
            <p
              className={cn(
                "text-xs",
                isOwnMessage ? "opacity-70" : "text-muted-foreground"
              )}
            >
              {format(parseISO(message.createdAt), "HH:mm", { locale: vi })}
            </p>

            {/* Read status indicator (only for staff messages) */}
            {isStaff && isOwnMessage && (
              <div
                className={cn(
                  "flex items-center",
                  isOwnMessage
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
                title={
                  message.isRead && message.readAt
                    ? `Đã đọc lúc ${format(parseISO(message.readAt), "HH:mm dd/MM/yyyy", { locale: vi })}`
                    : "Đã gửi"
                }
              >
                {message.isRead ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Translation toggle button */}
            {!isSystem && onTranslate && (
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "h-6 px-2 py-0",
                  isOwnMessage
                    ? "hover:bg-primary-foreground/20 text-primary-foreground"
                    : "hover:bg-muted-foreground/10"
                )}
                onClick={() => onTranslate(message)}
                disabled={message.isTranslating}
              >
                {message.isTranslating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Languages className="h-3 w-3 mr-1" />
                    <span className="text-xs">
                      {message.showTranslation ? "Bản gốc" : "Dịch"}
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Avatar (right side for own messages) */}
      {isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {isGuest ? "B" : message.staffName?.[0] || "S"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
