import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale"; // Assuming Vietnamese context based on "Mới"
import { CalendarDays, Clock, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils"; // Standard shadcn utility

interface NewRoomItemCardProps {
  roomId: string;
  roomName: string;
  roomTypeName: string;
  fromDate: string | Date;
  toDate: string | Date;
  onRemove: () => void;
  className?: string;
}

export default function NewRoomItemCard({
  roomName,
  roomTypeName,
  fromDate,
  toDate,
  onRemove,
  className,
}: NewRoomItemCardProps) {
  // Helper to safely parse dates
  const parseDate = (date: string | Date) => {
    if (date instanceof Date) return date;
    return parseISO(date);
  };

  const start = parseDate(fromDate);
  const end = parseDate(toDate);

  // Calculate duration (nights)
  const nightCount =
    isValid(start) && isValid(end) ? differenceInCalendarDays(end, start) : 0;

  const formatDateStr = (date: Date) => {
    return isValid(date) ? format(date, "dd/MM", { locale: vi }) : "--/--";
  };

  return (
    <Card
      className={cn(
        "group relative border-dashed border-primary/50 bg-primary/5 p-0 overflow-hidden transition-colors hover:bg-primary/10",
        className
      )}
    >
      <div className="flex gap-3 p-3 items-center">
        {/* Room Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold truncate text-foreground">
                  {roomName}
                </h4>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5 border-green-500 text-green-600 bg-green-50 flex-shrink-0"
                >
                  Mới
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {roomTypeName}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-1 flex-shrink-0 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10"
              onClick={onRemove}
              aria-label="Xóa phòng"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Date Range & Duration */}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>
                {formatDateStr(start)} - {formatDateStr(end)}
              </span>
            </div>
            {nightCount > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium text-primary">
                <Clock className="h-3 w-3" />
                <span>{nightCount} đêm</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
