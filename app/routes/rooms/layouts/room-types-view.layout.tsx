import type { ReactNode } from "react";
import type { RoomTypeFilters } from "../container/useRoomTypeFilter";
import { RoomTypesFilterSidebar } from "../fragments/room-types/room-types-filter.sidebar";
import { RoomTypesHeader } from "../fragments/room-types/room-types-header.layout";

interface RoomTypesViewLayoutProps {
  children: ReactNode;
  filters: RoomTypeFilters;
  onFilterChange: <K extends keyof RoomTypeFilters>(
    key: K,
    value: RoomTypeFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalRoomTypes: number;
  onAddRoomType: () => void;
}

function RoomTypesViewLayout({
  children,
  filters,
  onFilterChange,
  onResetFilters,
  totalRoomTypes,
  onAddRoomType,
}: RoomTypesViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <RoomTypesFilterSidebar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />
      <main className="flex-1 space-y-4">
        <RoomTypesHeader
          totalRoomTypes={totalRoomTypes}
          onAddRoomType={onAddRoomType}
        />
        {children}
      </main>
    </div>
  );
}

export default RoomTypesViewLayout;
