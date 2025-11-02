import type { ReactNode } from "react";
import { Card, CardContent } from "~/components/ui/card";
import MenuCategoryCommandBar from "../fragments/menu-categories/command-bar";
import type { MenuCategoryFilters } from "../container/menu-categories/filter.hooks";

interface MenuCategoryViewLayoutProps {
  children: ReactNode;
  totalMenuCategories: number;
  updateFilter: <K extends keyof MenuCategoryFilters>(
    key: K,
    value: MenuCategoryFilters[K]
  ) => void;
  resetFilters: () => void;
  filters: MenuCategoryFilters;
}

/**
 * Layout cho menu category management page
 * Bao gồm header, stats, command bar, và content area
 */
export default function MenuCategoryViewLayout({
  children,
  totalMenuCategories,
  updateFilter,
  resetFilters,
  filters,
}: MenuCategoryViewLayoutProps) {
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
                  {totalMenuCategories}
                </span>{" "}
                món
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <MenuCategoryCommandBar
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
