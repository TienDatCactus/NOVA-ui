import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Search, MoreVertical } from "lucide-react";
import { cn } from "~/lib/utils";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  role?: "staff" | "customer";
};

type ChatSidebarProps = {
  conversations: Conversation[];
  selectedId?: string;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export default function ChatSidebar({
  conversations,
  selectedId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
}: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full border-r w-96 bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Tin nhắn</h2>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <Input
          placeholder="Tìm kiếm tin nhắn..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          startAddon={<Search className="h-4 w-4" />}
          className="h-9"
        />
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left",
                selectedId === conversation.id && "bg-muted"
              )}
            >
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12">
                  {conversation.avatar ? (
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold">
                      {conversation.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                {conversation.isOnline && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold text-sm truncate">
                    {conversation.name}
                  </p>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {formatMessageTime(conversation.lastMessageTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge
                      variant="default"
                      className="h-5 min-w-[20px] flex items-center justify-center px-1.5 text-xs"
                    >
                      {conversation.unreadCount > 99
                        ? "99+"
                        : conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatMessageTime(time: string): string {
  const date = parseISO(time);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return format(date, "HH:mm");
  } else if (diffInHours < 168) {
    // Less than a week
    return format(date, "EEE", { locale: vi });
  } else {
    return format(date, "dd/MM");
  }
}
