import type { ReactNode } from "react";
import MenuCategoryCommandBar from "../fragments/menu-categories/command-bar";
import type { MenuCategoryFilters } from "../container/menu-categories/filter.hooks";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface MenuCategoryViewLayoutProps {
  children: ReactNode;
  totalMenuCategories: number;
  updateFilter: <K extends keyof MenuCategoryFilters>(
    key: K,
    value: MenuCategoryFilters[K]
  ) => void;
  resetFilters: () => void;
  filters: MenuCategoryFilters;
  onAddCategory: () => void;
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
  onAddCategory,
}: MenuCategoryViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <MenuCategoryCommandBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />

      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý danh mục thực đơn</h1>
              <Badge variant="secondary" className="text-sm">
                {totalMenuCategories} danh mục
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý danh mục các món ăn và đồ uống của NOVA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onAddCategory} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm danh mục
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
