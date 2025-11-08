import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Phone, Video, MoreVertical, X } from "lucide-react";

type ChatHeaderProps = {
  name: string;
  avatar?: string;
  isOnline: boolean;
  subtitle?: string;
  onClose?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
};

export default function ChatHeader({
  name,
  avatar,
  isOnline,
  subtitle,
  onClose,
  onCall,
  onVideoCall,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
      {/* User info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative">
          <Avatar className="h-10 w-10">
            {avatar ? (
              <img src={avatar} alt={name} className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary font-semibold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {subtitle || (isOnline ? "Đang hoạt động" : "Không hoạt động")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {onCall && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onCall}
          >
            <Phone className="h-5 w-5 text-primary" />
          </Button>
        )}
        {onVideoCall && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onVideoCall}
          >
            <Video className="h-5 w-5 text-primary" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreVertical className="h-5 w-5" />
        </Button>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
