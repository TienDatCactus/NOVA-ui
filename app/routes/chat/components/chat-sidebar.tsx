import {
  MessageSquare,
  RotateCw,
  X,
  CloudFog,
  Search,
  Leaf,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { useStaffInbox } from "../container/query.hooks";
import ChatSessionCard from "../fragments/chat-session.cards";
import { cn } from "~/lib/utils";

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

  // Shared container style for the sidebar (Glass pane)
  const containerClasses =
    "flex w-80 flex-col border-r border-white/40 bg-white/60 backdrop-blur-xl h-full shadow-[5px_0_15px_-5px_rgba(0,0,0,0.03)]";

  if (isLoading) {
    return (
      <div className={cn(containerClasses, "p-4")}>
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight ">
            Hộp thư đến
          </h1>
          <p className="text-sm text-stone-500">Đang tải danh sách...</p>
        </div>

        <div className="space-y-3">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 w-full rounded-xl bg-stone-200/50"
              />
            ))}
        </div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className={cn(containerClasses, "p-4")}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 ">Hộp thư đến</h1>
            <p className="text-sm text-stone-500">Danh sách tin nhắn</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-stone-400 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-full"
          >
            <RotateCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 rounded-full bg-white/50 border border-white/60 shadow-sm flex items-center justify-center mb-4 relative">
            {/* Decorative mist */}
            <div className="absolute inset-0 bg-emerald-100/20 rounded-full blur-xl"></div>
            <CloudFog className="h-10 w-10 text-stone-400/70" />
          </div>
          <p className="font-semibold text-stone-700 mb-1">
            Thung lũng yên tĩnh
          </p>
          <p className="text-sm text-stone-500 max-w-[200px]">
            Hiện chưa có tin nhắn nào từ khách hàng.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(containerClasses, "p-4 space-y-4")}>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 ">Hộp thư đến</h1>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-700/80 bg-emerald-50/50 px-2 py-0.5 rounded-full w-fit mt-1">
              <Leaf className="w-3 h-3" />
              {sessions.length} cuộc hội thoại
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Làm mới"
            className="text-stone-400 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-full transition-all hover:rotate-180 duration-500"
          >
            <RotateCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Tìm theo tên, phòng..."
            className="w-full rounded-full bg-white/50 border-white/60 pl-9 pr-8 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-300 placeholder:text-stone-400 text-stone-700 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-stone-200/50 text-stone-400 hover:text-stone-600"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1 -mr-2 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-stone-500">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
              <Search className="h-5 w-5 opacity-40" />
            </div>
            <p className="text-sm font-medium">Không tìm thấy kết quả</p>
            <p className="text-xs text-stone-400 mt-1">
              Thử tìm kiếm với từ khóa khác
            </p>
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
