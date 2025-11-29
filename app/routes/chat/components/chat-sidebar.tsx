import { MessageSquare, RotateCw, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { useStaffInbox } from "../container/query.hooks";
import ChatSessionCard from "../fragments/chat-session.cards";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState, useMemo } from "react";
import { useDebounceValue } from "usehooks-ts";

interface ChatSidebarProps {
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
}

export function ChatSidebar({
  activeSessionId,
  onSessionSelect,
}: ChatSidebarProps) {
  const { data: sessions, isLoading, refetch, isRefetching } = useStaffInbox();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounceValue(searchTerm, 300);

  // Filter sessions based on search term
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    if (!debouncedSearch.trim()) return sessions;

    const search = debouncedSearch.toLowerCase();
    return sessions.filter(
      (session) =>
        session.customerName?.toLowerCase().includes(search) ||
        session.roomName?.toLowerCase().includes(search) ||
        session.lastMessagePreview?.toLowerCase().includes(search)
    );
  }, [sessions, debouncedSearch]);

  if (isLoading) {
    return (
      <div className="flex w-80 flex-col border border-r p-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hộp thư đến</h1>
            <p className="text-sm text-muted-foreground">
              Danh sách tin nhắn từ khách
            </p>
          </div>
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hộp thư đến</h1>
            <p className="text-sm text-muted-foreground">
              Danh sách tin nhắn từ khách
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RotateCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
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
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hộp thư đến</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Làm mới"
          >
            <RotateCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="relative">
          <Input
            placeholder="Tìm kiếm tin nhắn..."
            className="w-full rounded-full bg-background pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Không tìm thấy kết quả</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <ChatSessionCard
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onClick={onSessionSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
