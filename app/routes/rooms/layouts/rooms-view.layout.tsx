import type { ReactNode } from "react";

import { ArrowRightLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";
import { useRoomTypes } from "../container/room-types/query.hooks";
import type { RoomFilters } from "../container/rooms/filter.hooks";

interface RoomsViewLayoutProps {
  children: ReactNode;
  filters: RoomFilters;
  onFilterChange: <K extends keyof RoomFilters>(
    key: K,
    value: RoomFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalRooms: number;
}

function RoomsViewLayout({
  children,
  filters,
  onFilterChange,
  onResetFilters,
  totalRooms,
}: RoomsViewLayoutProps) {
  const { data: roomTypes } = useRoomTypes();
  return (
    <div className="flex gap-6 p-4">
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Quản lý phòng</h1>
            <p className="text-muted-foreground ">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalRooms}
              </span>{" "}
              phòng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) =>
                onFilterChange(
                  "status",
                  value === "all" ? undefined : (value as RoomFilters["status"])
                )
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(RoomStatusEnum).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <SelectItem id={`status-${key}`} value={key}>
                      {value}
                    </SelectItem>
                  </div>
                ))}
              </SelectContent>
            </Select>
            <ArrowRightLeft className="w-4 h-4" />
            <Select
              value={filters.typeId ?? "all"}
              onValueChange={(value) =>
                onFilterChange(
                  "typeId",
                  value === "all" ? undefined : (value as RoomFilters["typeId"])
                )
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Hạng phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {roomTypes?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <SelectItem id={`status-${item.id}`} value={item.id}>
                      {item.name}
                    </SelectItem>
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default RoomsViewLayout;
