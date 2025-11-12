import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import {
  Phone,
  Video,
  MoreVertical,
  X,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import Image from "~/components/ui/image";
import type { ChatSessionStatus } from "~/services/api/chat/dto";

type ChatHeaderProps = {
  name: string;
  avatar?: string;
  isOnline: boolean;
  subtitle?: string;
  sessionStatus?: ChatSessionStatus;
  roomName?: string;
  onClose?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
};

export default function ChatHeader({
  name,
  avatar,
  isOnline,
  subtitle,
  sessionStatus,
  roomName,
  onClose,
  onCall,
  onVideoCall,
}: ChatHeaderProps) {
  const getStatusBadge = () => {
    if (!sessionStatus) return null;

    const statusConfig = {
      Active: {
        variant: "default" as const,
        label: "Đang hoạt động",
        color: "bg-green-500",
      },
      Closed: {
        variant: "secondary" as const,
        label: "Đã đóng",
        color: "bg-gray-500",
      },
      Expired: {
        variant: "destructive" as const,
        label: "Hết hạn",
        color: "bg-red-500",
      },
    };

    const config = statusConfig[sessionStatus];
    return (
      <Badge variant={config.variant} className="h-5 text-xs gap-1">
        <div className={`h-2 w-2 rounded-full ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shadow-sm rounded-none">
      {/* User info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative">
          <Avatar className="h-11 w-11">
            {avatar ? (
              <Image src={avatar} alt={name} className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold text-sm">
                {(roomName || name).charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-card" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-foreground">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground truncate">
              {subtitle || (isOnline ? "Đang hoạt động" : "Không hoạt động")}
            </p>
            {sessionStatus && (
              <div className="flex-shrink-0">{getStatusBadge()}</div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {onCall && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={onCall}
          >
            <Phone className="h-5 w-5" />
          </Button>
        )}
        {onVideoCall && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={onVideoCall}
          >
            <Video className="h-5 w-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </Card>
  );
}
