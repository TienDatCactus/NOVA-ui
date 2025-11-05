import type { ReactNode } from "react";
import RoomTypesCommandBar from "../fragments/room-types/command-bar";
import type { RoomTypeFilters } from "../container/room-types/filter.hooks";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Download, Plus } from "lucide-react";

interface RoomTypesViewLayoutProps {
  children: ReactNode;
  filters: RoomTypeFilters;
  updateFilter: <K extends keyof RoomTypeFilters>(
    key: K,
    value: RoomTypeFilters[K]
  ) => void;
  resetFilters: () => void;
  totalRoomTypes: number;
  onAddRoomType: () => void;
}

function RoomTypesViewLayout({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalRoomTypes,
  onAddRoomType,
}: RoomTypesViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <RoomTypesCommandBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý hạng phòng</h1>
              <Badge variant="secondary">{totalRoomTypes} hạng phòng</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các loại hạng phòng và giá trong NOVA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="success-outline">
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
            <Button onClick={onAddRoomType}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm hạng phòng
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default RoomTypesViewLayout;
