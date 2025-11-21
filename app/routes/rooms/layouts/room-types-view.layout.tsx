import type { ReactNode } from "react";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import type { RoomTypeFilters } from "../container/room-types/filter.hooks";

interface RoomTypesViewLayoutProps {
  children: ReactNode;
  filters: RoomTypeFilters;
  onFilterChange: <K extends keyof RoomTypeFilters>(
    key: K,
    value: RoomTypeFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalRoomTypes: number;
}

function RoomTypesViewLayout({
  children,
  filters,
  onFilterChange,
  onResetFilters,
  totalRoomTypes,
}: RoomTypesViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4 ">
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý hạng phòng</h1>
            <p className="text-muted-foreground mt-1">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalRoomTypes}
              </span>{" "}
              hạng phòng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={filters.activeFilter === "active"}
                onCheckedChange={(checked) =>
                  onFilterChange("activeFilter", checked ? "active" : "all")
                }
                value="active"
                id="active"
              />
              <Label htmlFor="active">Đang hoạt động</Label>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default RoomTypesViewLayout;
