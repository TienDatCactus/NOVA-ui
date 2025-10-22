import type { ReactNode } from "react";
import type { RoomFilters } from "../container/useRoomFilter";
import RoomsFilterSidebar from "../fragments/rooms-filter.sidebar";

interface RoomsViewLayoutProps {
  children: ReactNode;
  filters: RoomFilters;
  onFilterChange: <K extends keyof RoomFilters>(
    key: K,
    value: RoomFilters[K]
  ) => void;
  onResetFilters: () => void;
}

function RoomsViewLayout({
  children,
  filters,
  onFilterChange,
  onResetFilters,
}: RoomsViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <RoomsFilterSidebar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />
      <main className="flex-1 space-y-4">{children}</main>
    </div>
  );
}

export default RoomsViewLayout;
