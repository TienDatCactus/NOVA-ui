import type { ReactNode } from "react";
import type { RoomFilters } from "../container/rooms-filter.hooks";
import RoomsFilterSidebar from "../fragments/rooms/rooms-filter.sidebar";
import RoomsHeader from "../fragments/rooms/rooms-header.layout";
import { useRoomTypes } from "../container/room-types-query.hooks";

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
    <div className="flex gap-6">
      <RoomsFilterSidebar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        roomTypes={roomTypes || []}
      />
      <main className="flex-1 space-y-4">
        <RoomsHeader totalRooms={totalRooms} onAddRoom={onAddRoom} />
        {children}
      </main>
    </div>
  );
}

export default RoomsViewLayout;
