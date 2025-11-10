import { Button } from "~/components/ui/button";
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
      {STATUS_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={activeStatus === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
