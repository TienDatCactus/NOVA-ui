import type { ReactNode } from "react";
import MenuItemsHeaderLayout from "../fragments/menu-items/menu-items-header.layout";
import MenuItemsFilterSidebar from "../fragments/menu-items/menu-items-filter.sidebar";
import type { MenuCategoryWithItems } from "~/services/api/menu-item/dto";

interface MenuItemsViewLayoutProps {
  children: ReactNode;
  totalItems: number;
  selectedCount: number;
  onAddItem: () => void;
  onImport: () => void;
  onExport: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: MenuCategoryWithItems[];
  selectedCategories: string[];
  onCategoryToggle: (categoryCode: string) => void;
  onSelectAll: () => void;
  onClearFilters: () => void;
  showInactive: boolean;
  onToggleInactive: (checked: boolean) => void;
}

export default function MenuItemsViewLayout({
  children,
  totalItems,
  selectedCount,
  onAddItem,
  onImport,
  onExport,
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategories,
  onCategoryToggle,
  onSelectAll,
  onClearFilters,
  showInactive,
  onToggleInactive,
}: MenuItemsViewLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <MenuItemsHeaderLayout
        totalItems={totalItems}
        selectedCount={selectedCount}
        onAddItem={onAddItem}
        onImport={onImport}
        onExport={onExport}
      />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 shrink-0 overflow-y-auto">
          <MenuItemsFilterSidebar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={onCategoryToggle}
            onSelectAll={onSelectAll}
            onClearFilters={onClearFilters}
            showInactive={showInactive}
            onToggleInactive={onToggleInactive}
          />
        </div>

        {/* Main Table */}
        <main className="flex-1 p-6 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
