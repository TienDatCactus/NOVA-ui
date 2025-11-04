import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface ExistingRoomItemCardProps {
  roomId: string;
  roomName: string;
  roomTypeName: string;
  fromDate: string | Date;
  toDate: string | Date;
  status?: string;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

export default function ExistingRoomItemCard({
  roomId,
  roomName,
  roomTypeName,
  fromDate,
  toDate,
  status,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: ExistingRoomItemCardProps) {
  const formatDate = (date: string | Date) => {
    if (typeof date === "string") {
      return format(parseISO(date), "dd/MM");
    }
    return format(date, "dd/MM");
  };

  return (
    <Card
      className={cn(
        "transition-colors cursor-pointer",
        isSelected && "border-primary bg-primary/5"
      )}
    >
      <div onClick={onSelect} className="p-3 flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-sm">{roomName}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {roomTypeName}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            {formatDate(fromDate)} → {formatDate(toDate)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isExpanded && (
        <CardContent className="pt-0 pb-3">
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Trạng thái:</span>
                <div className="font-medium">{status || "N/A"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Hạng phòng:</span>
                <div className="font-medium">{roomTypeName || "N/A"}</div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
