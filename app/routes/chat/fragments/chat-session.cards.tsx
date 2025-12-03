import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import type { StaffChatInboxItemDto } from "~/services/api/chat/dto";
import { User, MapPin } from "lucide-react";

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
        "group flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-all duration-300 border border-transparent",
        // Active State: Soft Emerald Glow
        isActive
          ? "bg-emerald-50/60 ring-1 ring-emerald-100 shadow-sm"
          : "hover:bg-white/40 hover:border-white/40 hover:shadow-sm"
      )}
      onClick={() => onClick(id)}
    >
      <Avatar
        className={cn(
          "h-10 w-10 border transition-colors",
          isActive ? "border-emerald-200" : "border-white/50"
        )}
      >
        <AvatarFallback
          className={cn(
            "text-sm font-medium transition-colors",
            isActive
              ? "bg-emerald-100 text-emerald-800"
              : "bg-stone-200/50 text-stone-500 group-hover:bg-white group-hover:text-emerald-700"
          )}
        >
          {customerName.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-semibold text-sm truncate transition-colors",
                isActive ? "text-emerald-950" : "text-stone-700"
              )}
            >
              {customerName}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-600/70" />
              <p className="text-xs font-medium text-emerald-700/80 truncate">
                Phòng {roomName}
              </p>
            </div>
          </div>

          {lastMessageAt && (
            <span
              className={cn(
                "text-[10px] whitespace-nowrap pt-0.5 font-medium",
                isActive
                  ? "text-emerald-600/80"
                  : "text-stone-400 group-hover:text-stone-500"
              )}
            >
              {format(parseISO(lastMessageAt), "HH:mm", { locale: vi })}
            </span>
          )}
        </div>

        {lastMessagePreview && (
          <p
            className={cn(
              "text-sm truncate line-clamp-1 mt-1.5 font-normal",
              isActive ? "text-stone-600" : "text-stone-500/80"
            )}
          >
            {lastMessagePreview}
          </p>
        )}

        {assignedStaffName && (
          <div className="flex items-center gap-1.5 mt-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 h-5 border font-normal rounded-md",
                isActive
                  ? "bg-white/60 border-emerald-200 text-emerald-800"
                  : "bg-stone-100/50 border-stone-200 text-stone-500"
              )}
            >
              <User className="w-2.5 h-2.5 mr-1 opacity-70" />
              {assignedStaffName}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSessionCard;
