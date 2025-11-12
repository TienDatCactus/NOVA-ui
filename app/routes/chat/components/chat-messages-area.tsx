import { ScrollArea } from "~/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import ChatMessage from "./chat-message";
import { format, parseISO, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageSquare } from "lucide-react";

type Message = {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  status?: "sending" | "sent" | "delivered" | "read";
};

type ChatMessagesAreaProps = {
  messages: Message[];
  isLoading?: boolean;
};

export default function ChatMessagesArea({
  messages,
  isLoading = false,
}: ChatMessagesAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <ScrollArea className="flex-1 max-h-[70vh] bg-muted/20">
      <div ref={scrollRef} className="px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">
                Đang tải tin nhắn...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-6xl mb-4">
                <MessageSquare />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Chưa có tin nhắn nào
              </h3>
              <p className="text-sm text-muted-foreground">
                Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
              </p>
            </div>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatDateDivider(date)}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                {msgs.map((message, index) => {
                  const prevMessage = msgs[index - 1];
                  const showAvatar =
                    !prevMessage || prevMessage.isOwn !== message.isOwn;

                  return (
                    <ChatMessage
                      key={message.id}
                      {...message}
                      showAvatar={showAvatar}
                    />
                  );
                })}
              </div>
            ))}
          </>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  const groups: Record<string, Message[]> = {};

  messages.forEach((message) => {
    const date = parseISO(message.timestamp);
    const dateKey = format(date, "yyyy-MM-dd");

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return groups;
}

function formatDateDivider(dateString: string): string {
  const date = dateString;
  const today = new Date();

  if (isSameDay(date, today)) {
    return "Hôm nay";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return "Hôm qua";
  }

  return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
}
