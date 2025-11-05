import type { ReactNode } from "react";
import type { MenuFilters } from "~/services/types/menu.types";
import { useMenuCategories } from "../container/menu-categories/query.hooks";
import MenuCommandBar from "../fragments/menu/command-bar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface MenuViewLayoutProps {
  children: ReactNode;
  totalMenuItems: number;
  updateFilter: <K extends keyof MenuFilters>(
    key: K,
    value: MenuFilters[K]
  ) => void;
  resetFilters: () => void;
  filters: MenuFilters;
  onAddMenuItem: () => void;
}

export default function MenuViewLayout({
  children,
  totalMenuItems,
  updateFilter,
  resetFilters,
  filters,
  onAddMenuItem,
}: MenuViewLayoutProps) {
  const { data: menuCategories } = useMenuCategories({ includeInactive: true });

  return (
    <div className="flex gap-6">
      <MenuCommandBar
        menuCategories={menuCategories}
        filters={filters}
        resetFilters={resetFilters}
        updateFilter={updateFilter}
      />

      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý thực đơn</h1>
              <Badge variant="secondary" className="text-sm">
                {totalMenuItems} món
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các món ăn và đồ uống của NOVA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onAddMenuItem} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm món
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
