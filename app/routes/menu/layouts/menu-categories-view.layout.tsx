import type { ReactNode } from "react";
import type { MenuCategoryFilters } from "../container/menu-category-filter.hooks";
import MenuCategoryCommandBar from "../fragments/menu-category-command-bar";

interface MenuCategoriesViewLayoutProps {
  children: ReactNode;
  filters: MenuCategoryFilters;
  onFilterChange: <K extends keyof MenuCategoryFilters>(
    key: K,
    value: MenuCategoryFilters[K]
  ) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalCategories: number;
  selectedCount: number;
  onAddCategory: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
}

export default function MenuCategoriesViewLayout({
  children,
  filters,
  onFilterChange,
  searchQuery,
  setSearchQuery,
  totalCategories,
  selectedCount,
  onAddCategory,
  onExportExcel,
  onClearSelection,
}: MenuCategoriesViewLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Quản lý danh mục thực đơn
              </h1>
              <p className="text-muted-foreground mt-1">
                Quản lý các danh mục thực đơn của nhà hàng
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Tổng số:{" "}
                <span className="font-semibold text-foreground">
                  {totalCategories}
                </span>{" "}
                danh mục
              </div>
            </div>
          </div>
        </div>

        {/* Command Bar */}
        <MenuCategoryCommandBar
          filters={filters}
          onFilterChange={onFilterChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCount={selectedCount}
          onAddCategory={onAddCategory}
          onExportExcel={onExportExcel}
          onClearSelection={onClearSelection}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-background">{children}</main>
    </div>
  );
}
