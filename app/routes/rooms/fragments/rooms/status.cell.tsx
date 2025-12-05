import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";
import { useUpdateRoomStatus } from "../../container/rooms/mutation.hooks";
import { cn } from "~/lib/utils";
import { Loader2 } from "lucide-react"; // Icon loading

interface RoomStatusCellProps {
  room: RoomListItemDto;
}

// 1. Định nghĩa cấu hình màu sắc chặt chẽ theo Enum
// Việc này đảm bảo nếu bạn thêm status mới vào Enum, TS sẽ báo lỗi nếu thiếu màu
export const ROOM_STATUS_CONFIG: Record<
  keyof typeof RoomStatusEnum,
  {
    label: string;
    style: {
      trigger: string;
      focus: string;
      icon: string;
      dot: string; // Màu cho chấm tròn trong dropdown
    };
  }
> = {
  Ready: {
    label: "Sẵn sàng",
    style: {
      trigger:
        "border-green-600 bg-green-500/10 text-green-700 hover:bg-green-500/20",
      focus: "focus:ring-green-600/30",
      icon: "text-green-600",
      dot: "bg-green-500",
    },
  },
  Dirty: {
    label: "Chưa dọn",
    style: {
      trigger:
        "border-orange-600 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20",
      focus: "focus:ring-orange-600/30",
      icon: "text-orange-600",
      dot: "bg-orange-500",
    },
  },
  Cleaning: {
    label: "Đang dọn",
    style: {
      trigger:
        "border-blue-600 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
      focus: "focus:ring-blue-600/30",
      icon: "text-blue-600",
      dot: "bg-blue-500",
    },
  },
  Maintenance: {
    label: "Bảo trì",
    style: {
      trigger:
        "border-amber-600 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
      focus: "focus:ring-amber-600/30",
      icon: "text-amber-600",
      dot: "bg-amber-500",
    },
  },
  OutOfService: {
    label: "Ngừng hoạt động",
    style: {
      trigger: "border-red-600 bg-red-500/10 text-red-700 hover:bg-red-500/20",
      focus: "focus:ring-red-600/30",
      icon: "text-red-600",
      dot: "bg-red-500",
    },
  },
  Locked: {
    label: "Đã khóa",
    style: {
      trigger:
        "border-slate-500 bg-slate-500/10 text-slate-700 hover:bg-slate-500/20",
      focus: "focus:ring-slate-500/30",
      icon: "text-slate-500",
      dot: "bg-slate-500",
    },
  },
};

function RoomStatusCell({ room }: RoomStatusCellProps) {
  const { mutate, isPending } = useUpdateRoomStatus();

  // Ép kiểu an toàn cho status hiện tại
  const currentStatusKey = room.status as keyof typeof RoomStatusEnum;
  const config =
    ROOM_STATUS_CONFIG[currentStatusKey] || ROOM_STATUS_CONFIG.Ready;

  const handleStatusChange = (newStatus: string) => {
    // Chỉ gọi API nếu status thực sự thay đổi
    if (newStatus !== room.status) {
      mutate({ roomId: room.roomId, status: newStatus });
    }
  };

  return (
    <div
      className="flex items-center justify-start"
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        disabled={isPending}
        value={room.status}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-[140px] px-2 text-xs font-medium transition-colors", // Compact size cho bảng dữ liệu
            "border shadow-sm",
            config.style.trigger,
            config.style.focus,
            // Override icon color
            "[&>svg]:opacity-100",
            `[&>svg]:${config.style.icon}`,
            isPending && "opacity-70 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-2">
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span className={cn("h-2 w-2 rounded-full", config.style.dot)} />
            )}
            <SelectValue>{config.label}</SelectValue>
          </div>
        </SelectTrigger>

        <SelectContent align="start">
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground px-2 py-1.5 font-normal">
              Cập nhật trạng thái
            </SelectLabel>
            {Object.entries(RoomStatusEnum).map(([key, _val]) => {
              const statusKey = key as keyof typeof RoomStatusEnum;
              const itemConfig = ROOM_STATUS_CONFIG[statusKey];

              // Skip nếu không có config (an toàn)
              if (!itemConfig) return null;

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="text-xs focus:bg-accent focus:text-accent-foreground cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Visual indicator trong dropdown giúp user nhận diện màu sắc trước khi chọn */}
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        itemConfig.style.dot
                      )}
                    />
                    <span>{itemConfig.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default RoomStatusCell;
