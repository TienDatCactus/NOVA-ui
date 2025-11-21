import type { ReactNode } from "react";

import RoomsFilterSidebar from "../fragments/rooms/filter.sidebar";
import type { RoomFilters } from "../container/rooms/filter.hooks";
import { useRoomTypes } from "../container/room-types/query.hooks";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface RoomsViewLayoutProps {
  children: ReactNode;
  filters: RoomFilters;
  onFilterChange: <K extends keyof RoomFilters>(
    key: K,
    value: RoomFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalRooms: number;
  onAddRoom: () => void;
}

function RoomsViewLayout({
  children,
  filters,
  onFilterChange,
  onResetFilters,
  totalRooms,
  onAddRoom,
}: RoomsViewLayoutProps) {
  const { data: roomTypes } = useRoomTypes();
  return (
    <div className="grid gap-6 p-4">
      <RoomsFilterSidebar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        roomTypes={roomTypes || []}
      />
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý phòng</h1>
            <p className="text-muted-foreground mt-1">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalRooms}
              </span>{" "}
              phòng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onAddRoom} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm phòng
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default RoomsViewLayout;
