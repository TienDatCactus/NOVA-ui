import { useMemo, useState } from "react";
import type { MenuCategoryDetailDto } from "~/services/api/menu-category/dto";
import type { MenuCategoryWithItems } from "~/services/api/menu-item/dto";

export interface MenuItemFilters {
  searchText: string;
  activeFilter: "all" | "active";
  categoryCode: MenuCategoryDetailDto["code"];
}

const DEFAULT_FILTERS: MenuItemFilters = {
  searchText: "",
  activeFilter: "all",
  categoryCode: "",
};

export default function useMenuFilter() {
  const [filters, setFilters] = useState<MenuItemFilters>(DEFAULT_FILTERS);

  const includeInactive = filters.activeFilter !== "active";

  const updateFilter = <K extends keyof MenuItemFilters>(
    key: K,
    value: MenuItemFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const filterMenuItems = useMemo(
    () =>
      (data: MenuCategoryWithItems[] | undefined): MenuCategoryWithItems[] => {
        if (!data) return [];

        const search = filters.searchText.trim().toLowerCase();

        return (
          data
            // Filter categories by active (when includeInactive is false)
            .filter((category) => includeInactive || category.active)
            // Filter by selected category code if provided
            .filter(
              (category) =>
                !filters.categoryCode ||
                category.categoryCode === filters.categoryCode
            )
            // Map and filter items per category
            .map((category) => {
              const items = category.items.filter((item) => {
                if (!includeInactive && !item.active) return false;
                if (!search) return true;

                const inCode = item.code.toLowerCase().includes(search);
                const inName = item.name.toLowerCase().includes(search);
                const inDesc = (item.description || "")
                  .toLowerCase()
                  .includes(search);
                return inCode || inName || inDesc;
              });

              return { ...category, items } as MenuCategoryWithItems;
            })
            // Remove categories that no longer have any items after filtering
            .filter((category) => category.items.length > 0)
        );
      },
    [filters, includeInactive]
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    includeInactive,
    filterMenuItems,
  };
}
