import type { ReactNode } from "react";
import type { MenuFilters } from "~/services/types/menu.types";
import { useMenuCategories } from "../container/menu-categories/query.hooks";
import MenuCommandBar from "../fragments/menu/command-bar";

interface MenuViewLayoutProps {
  children: ReactNode;
  totalMenuItems: number;
  updateFilter: <K extends keyof MenuFilters>(
    key: K,
    value: MenuFilters[K]
  ) => void;
  resetFilters: () => void;
  filters: MenuFilters;
}

export default function MenuViewLayout({
  children,
  totalMenuItems,
  updateFilter,
  resetFilters,
  filters,
}: MenuViewLayoutProps) {
  const { data: menuCategories } = useMenuCategories();

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
      </div>

      <div className="flex gap-2">
        <MenuCommandBar
          menuCategories={menuCategories}
          filters={filters}
          resetFilters={resetFilters}
          updateFilter={updateFilter}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
