import { cn } from "~/lib/utils";
import { Avatar } from "~/components/ui/avatar";
import { format, parseISO } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

type Message = {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  status?: "sending" | "sent" | "delivered" | "read";
};

type ChatMessageProps = Message & {
  showAvatar?: boolean;
};

export default function ChatMessage({
  id,
  content,
  timestamp,
  isOwn,
  senderName,
  senderAvatar,
  status = "sent",
  showAvatar = true,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-2 mb-4 group",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName || "User"}
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground text-sm font-semibold">
              {senderName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </Avatar>
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col",
          isOwn ? "items-end" : "items-start",
          "max-w-[70%]"
        )}
      >
        {/* Sender name (for received messages) */}
        {!isOwn && senderName && (
          <span className="text-xs text-muted-foreground mb-1 px-3">
            {senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 break-words",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>

        {/* Timestamp and status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 px-3",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}
        >
          <span className="text-xs text-muted-foreground">
            {format(parseISO(timestamp), "HH:mm")}
          </span>
          {isOwn && (
            <span className="text-muted-foreground">
              {status === "read" ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : status === "delivered" ? (
                <CheckCheck className="h-3 w-3" />
              ) : status === "sent" ? (
                <Check className="h-3 w-3" />
              ) : (
                <div className="h-3 w-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
