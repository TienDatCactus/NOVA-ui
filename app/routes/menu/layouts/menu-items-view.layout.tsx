import type { ReactNode } from "react";
import type { MenuItemFilters } from "../container/use-menu-item-filter.hooks";
import type { MenuCategoryWithItems } from "~/services/api/menu-item/dto";
import MenuItemsCommandBar from "../fragments/menu-items/menu-items-command-bar";

interface MenuItemsViewLayoutProps {
  children: ReactNode;
  filters: MenuItemFilters;
  onFilterChange: <K extends keyof MenuItemFilters>(
    key: K,
    value: MenuItemFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalItems: number;
  selectedCount: number;
  onAddItem: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
  categories: MenuCategoryWithItems[];
}

export default function MenuItemsViewLayout({
  children,
  filters,
  onFilterChange,
  totalItems,
  selectedCount,
  onAddItem,
  onExportExcel,
  onClearSelection,
  onResetFilters,
  categories,
}: MenuItemsViewLayoutProps) {
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
                Quản lý các món ăn và đồ uống của khách sạn
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Tổng số:{" "}
                <span className="font-semibold text-foreground">
                  {totalItems}
                </span>{" "}
                món ăn
              </div>
            </div>
          </div>
        </div>

        <MenuItemsCommandBar
          categories={categories}
          filters={filters}
          onFilterChange={onFilterChange}
          selectedCount={selectedCount}
          onAddItem={onAddItem}
          onExportExcel={onExportExcel}
          onClearSelection={onClearSelection}
          onResetFilters={onResetFilters}
        />
      </div>

      <main className="flex-1">{children}</main>
    </div>
  );
}
