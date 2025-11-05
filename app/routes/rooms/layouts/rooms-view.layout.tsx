import type { ReactNode } from "react";
import RoomsCommandBar from "../fragments/rooms/command-bar";
import type { RoomFilters } from "../container/rooms/filter.hooks";
import { useRoomTypes } from "../container/room-types/query.hooks";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus } from "lucide-react";

interface RoomsViewLayoutProps {
  children: ReactNode;
  filters: RoomFilters;
  updateFilter: <K extends keyof RoomFilters>(
    key: K,
    value: RoomFilters[K]
  ) => void;
  resetFilters: () => void;
  totalRooms: number;
  onAddRoom: () => void;
}

function RoomsViewLayout({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalRooms,
  onAddRoom,
}: RoomsViewLayoutProps) {
  const { data: roomTypes } = useRoomTypes({ includeInactive: true });
  
  return (
    <div className="flex gap-6">
      <RoomsCommandBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        roomTypes={roomTypes || []}
      />
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý phòng</h1>
              <Badge variant="secondary" className="text-sm">
                {totalRooms} phòng
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý thông tin và trạng thái các phòng trong NOVA
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
