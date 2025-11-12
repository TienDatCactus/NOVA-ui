import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { StatusOptions } from "~/services/api/orders/order.types";

type OrderStatus = "All" | "Open" | "Completed" | "Cancelled";

interface StatusFilterProps {
  activeStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
}

export default function StatusFilter({
  activeStatus,
  onStatusChange,
}: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {StatusOptions.map((option) => {
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
