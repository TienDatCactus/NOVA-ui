import { X, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Image from "~/components/ui/image";

interface NewRoomItemCardProps {
  roomId: string;
  roomName: string;
  roomTypeName: string;
  imageUrl?: string;
  fromDate: string | Date;
  toDate: string | Date;
  onRemove: () => void;
}

export default function NewRoomItemCard({
  roomName,
  roomTypeName,
  imageUrl,
  fromDate,
  toDate,
  onRemove,
}: NewRoomItemCardProps) {
  const formatDate = (date: string | Date) => {
    if (typeof date === "string") {
      return format(parseISO(date), "dd/MM");
    }
    return format(date, "dd/MM");
  };

  return (
    <Card className="border-dashed border-primary/50 bg-primary/5 p-0 overflow-hidden">
      <div className="flex gap-3 p-3 items-center">
        {/* Room Image */}
        <div className="flex-shrink-0">
          <Image
            src={imageUrl || ""}
            alt={roomName}
            className="w-16 h-12 object-cover rounded-md"
          />
        </div>

        {/* Room Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{roomName}</p>
                <Badge variant="success" className="text-xs flex-shrink-0">
                  Mới
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {roomTypeName}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Date Range */}
          {fromDate && toDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
              <Clock className="h-3 w-3" />
              {formatDate(fromDate)} → {formatDate(toDate)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
