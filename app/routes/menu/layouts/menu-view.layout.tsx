import type { ReactNode } from "react";
import type { MenuFilters } from "~/services/types/menu.types";
import MenuCommandBar from "../fragments/command-bar";
import { useQuery } from "@tanstack/react-query";
import { MenuCategoryService } from "~/services/api/menu-category";

interface MenuViewLayoutProps {
  children: ReactNode;
  filters: MenuFilters;
  onFilterChange: <K extends keyof MenuFilters>(
    key: K,
    value: MenuFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalMenuItems: number;
  selectedCount: number;
  onAddMenuItem: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
}

export default function MenuViewLayout({
  children,
  filters,
  onFilterChange,
  totalMenuItems,
  selectedCount,
  onAddMenuItem,
  onExportExcel,
  onClearSelection,
  onResetFilters,
}: MenuViewLayoutProps) {
  const { data: menuCategories } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: async () => await MenuCategoryService.getMenuCategoryList(),
  });

  return (
    <div className="flex flex-col space-y-2 h-full">
      <div className="border-b">
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Quản lý thực đơn
              </h1>
              <p className="text-muted-foreground mt-1">
                Quản lý các món ăn và đồ uống của nhà hàng
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Tổng số:{" "}
                <span className="font-semibold text-foreground">
                  {totalMenuItems}
                </span>{" "}
                món
              </div>
            </div>
          </div>
        </div>

        <MenuCommandBar
          menuCategories={menuCategories || []}
          filters={filters}
          onFilterChange={onFilterChange}
          selectedCount={selectedCount}
          onAddMenuItem={onAddMenuItem}
          onExportExcel={onExportExcel}
          onClearSelection={onClearSelection}
          onResetFilters={onResetFilters}
        />
      </div>

      <main className="flex-1">{children}</main>
    </div>
  );
}
