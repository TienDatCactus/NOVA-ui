import { MessageSquare } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { useStaffInbox } from "../container/query.hooks";
import ChatSessionCard from "../fragments/chat-session.cards";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";

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
        <div className="mb-6 grid gap-2">
          <h1 className="text-2xl font-bold">Hộp thư đến</h1>
          <p className="text-sm text-muted-foreground">
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
        <div className="mb-6 grid gap-2">
          <h1 className="text-2xl font-bold">Hộp thư đến</h1>
          <p className="text-sm text-muted-foreground">
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
    <div className="flex w-80 flex-col space-y-4 border border-r p-4">
      <div className=" grid gap-4">
        <h1 className="text-2xl font-bold">Hộp thư đến</h1>
        <Input
          placeholder="Tìm kiếm tin nhắn..."
          className="w-full rounded-full bg-background "
        />
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {sessions.map((session) => (
          <ChatSessionCard
            key={session.id}
            session={session}
            isActive={session.id === activeSessionId}
            onClick={onSessionSelect}
          />
        ))}
      </div>
    </div>
  );
}
