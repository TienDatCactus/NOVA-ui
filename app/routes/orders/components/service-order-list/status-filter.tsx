import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { ServiceOrderDetailDto } from "~/services/api/orders/dto";

type ServiceOrderStatus = ServiceOrderDetailDto["status"] | "All";

interface StatusFilterProps {
  activeStatus: ServiceOrderStatus;
  onStatusChange: (status: ServiceOrderStatus) => void;
}

const STATUS_OPTIONS: { value: ServiceOrderStatus; label: string }[] = [
  { value: "All", label: "Tất cả" },
  { value: "Scheduled", label: "Đã lên lịch" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "NoShow", label: "Không đến" },
];

export default function StatusFilter({
  activeStatus,
  onStatusChange,
}: StatusFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {STATUS_OPTIONS.map((option) => {
        const isActive = activeStatus === option.value;
        return (
          <Badge
            key={option.value}
            variant={isActive ? "default" : "outline"}
            className={cn(
              "cursor-pointer select-none transition-all",
              "hover:shadow-sm",
              !isActive && "hover:bg-muted"
            )}
            onClick={() => onStatusChange(option.value)}
          >
            {option.label}
          </Badge>
        );
      })}
    </div>
  );
}
