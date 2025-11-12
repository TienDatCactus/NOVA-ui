import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Search, Filter, UserCheck, UserX, MessageSquare } from "lucide-react";
import { cn } from "~/lib/utils";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "~/components/ui/image";
import type { StaffInboxItemDto } from "~/services/api/chat/dto";
import type { InboxFilters } from "../container/inbox.hooks";

type ChatSidebarProps = {
  conversations: StaffInboxItemDto[];
  selectedSessionId?: string | null;
  onSelectConversation: (sessionId: string) => void;
  filters: InboxFilters;
  onFilterChange: <K extends keyof InboxFilters>(
    key: K,
    value: InboxFilters[K]
  ) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
};

export default function ChatSidebar({
  conversations,
  selectedSessionId,
  onSelectConversation,
  filters,
  onFilterChange,
  isLoading = false,
  hasNextPage = false,
  onLoadMore,
  totalCount = 0,
}: ChatSidebarProps) {
  return (
    <Card className="flex flex-col h-full w-96 bg-card shadow-sm rounded-none border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Hộp thư</h2>
            <p className="text-xs text-muted-foreground">
              {totalCount} cuộc hội thoại
            </p>
          </div>
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>

        {/* Search */}
        <Input
          placeholder="Tìm kiếm theo phòng, khách..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange("searchQuery", e.target.value)}
          startAddon={<Search className="h-4 w-4" />}
          className="h-9"
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.status === "active" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onFilterChange(
                "status",
                filters.status === "active" ? "all" : "active"
              )
            }
            className="h-7 text-xs"
          >
            Đang hoạt động
          </Button>
          <Button
            variant={filters.assigned === "unassigned" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onFilterChange(
                "assigned",
                filters.assigned === "unassigned" ? "all" : "unassigned"
              )
            }
            className="h-7 text-xs gap-1"
          >
            <UserX className="h-3 w-3" />
            Chưa xử lý
          </Button>
          <Button
            variant={filters.assigned === "assigned" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onFilterChange(
                "assigned",
                filters.assigned === "assigned" ? "all" : "assigned"
              )
            }
            className="h-7 text-xs gap-1"
          >
            <UserCheck className="h-3 w-3" />
            Đã nhận
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Không có cuộc trò chuyện
                </p>
              </div>
            </div>
          ) : (
            <>
              {conversations.map((conversation) => (
                <button
                  key={conversation.sessionId}
                  onClick={() => onSelectConversation(conversation.sessionId)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left",
                    selectedSessionId === conversation.sessionId &&
                      "bg-primary/10 border border-primary/20"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-11 w-11">
                      <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold text-sm">
                        {conversation.roomName.charAt(0).toUpperCase()}
                      </div>
                    </Avatar>
                    {conversation.status === "Active" && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-foreground">
                          {conversation.roomName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.customerName}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatMessageTime(conversation.lastMessageAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs text-muted-foreground truncate flex-1">
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

                    {/* Assigned Staff Badge */}
                    {conversation.assignedStaffName && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="h-5 text-xs gap-1 bg-secondary/50"
                        >
                          <UserCheck className="h-3 w-3" />
                          {conversation.assignedStaffName}
                        </Badge>
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Load More */}
              {hasNextPage && (
                <div className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLoadMore}
                    className="w-full"
                  >
                    Tải thêm
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
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
