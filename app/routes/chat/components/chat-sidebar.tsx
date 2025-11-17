import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { MessageSquare, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useStaffInbox } from "../container/query.hooks";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface ChatSessionCardProps {
  id: string;
  roomName: string;
  customerName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  assignedStaffName: string | null;
  state: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

const ChatSessionCard = ({
  id,
  roomName,
  customerName,
  lastMessage,
  lastMessageAt,
  assignedStaffName,
  state,
  isActive,
  onClick,
}: ChatSessionCardProps) => (
  <div
    className={cn(
      "hover:bg-muted flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors border",
      isActive && "bg-muted border-primary"
    )}
    onClick={() => onClick(id)}
  >
    <Avatar>
      <AvatarFallback>{customerName.charAt(0)}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{customerName}</p>
          <p className="text-xs text-muted-foreground">Phòng {roomName}</p>
        </div>
        {lastMessageAt && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(parseISO(lastMessageAt), "HH:mm", { locale: vi })}
          </span>
        )}
      </div>

      {lastMessage && (
        <p className="text-sm text-muted-foreground truncate line-clamp-1">
          {lastMessage}
        </p>
      )}

      {assignedStaffName && (
        <Badge variant="outline" className="mt-1 text-xs">
          {assignedStaffName}
        </Badge>
      )}
    </div>
  </div>
);

interface ChatSidebarProps {
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
}

export function ChatSidebar({
  activeSessionId,
  onSessionSelect,
}: ChatSidebarProps) {
  const { data: sessions, isLoading } = useStaffInbox();

  if (isLoading) {
    return (
      <div className="flex w-80 flex-col border border-r p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Hộp thư chat</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách tin nhắn từ khách
          </p>
        </div>

        <div className="space-y-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
        </div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex w-80 flex-col border border-r p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Hộp thư chat</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách tin nhắn từ khách
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium mb-1">Chưa có tin nhắn</p>
          <p className="text-sm text-muted-foreground">
            Các tin nhắn từ khách sẽ hiển thị ở đây
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-80 flex-col border border-r p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Hộp thư chat</h1>
          <Badge variant="default">{sessions.length}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Danh sách tin nhắn từ khách
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
        {sessions.map((session) => (
          <ChatSessionCard
            key={session.id}
            id={session.id}
            roomName={session.roomName}
            customerName={session.customerName}
            lastMessage={session.lastMessagePreview}
            lastMessageAt={session.lastMessageAt}
            assignedStaffName={session.assignedStaffName}
            state={session.state}
            isActive={session.id === activeSessionId}
            onClick={onSessionSelect}
          />
        ))}
      </div>
    </div>
  );
}
