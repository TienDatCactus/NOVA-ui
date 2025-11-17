import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import type {
  ChatSessionMessagesDto,
  StaffChatInboxItemDto,
} from "~/services/api/chat/dto";

interface ChatSessionCardProps {
  session: StaffChatInboxItemDto;
  isActive: boolean;
  onClick: (id: string) => void;
}

const ChatSessionCard = ({
  session,
  isActive,
  onClick,
}: ChatSessionCardProps) => {
  const {
    id,
    roomName,
    customerName,
    lastMessagePreview,
    lastMessageAt,
    assignedStaffName,
  } = session;
  return (
    <div
      className={cn(
        "hover:bg-muted flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors",
        isActive && "bg-muted"
      )}
      onClick={() => onClick(id)}
    >
      <Avatar>
        <AvatarFallback className="border">
          {customerName.charAt(0)}
        </AvatarFallback>
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

        {lastMessagePreview && (
          <p className="text-sm text-muted-foreground truncate line-clamp-1">
            {lastMessagePreview}
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
};

export default ChatSessionCard;
