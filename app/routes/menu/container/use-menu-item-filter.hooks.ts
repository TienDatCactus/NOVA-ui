import { useState, useMemo } from "react";
import type { MenuCategoryWithItems } from "~/services/api/menu-item/dto";

export interface MenuItemFilters {
  searchQuery: string;
  selectedCategories: string[];
  showInactive: boolean;
}

export default function useMenuItemFilter(
  data: MenuCategoryWithItems[] | undefined
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showInactive, setShowInactive] = useState(true);

  const categories = data || [];

  // Toggle category selection
  const handleCategoryToggle = (categoryCode: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryCode)
        ? prev.filter((c) => c !== categoryCode)
        : [...prev, categoryCode]
    );
  };

  // Select all categories
  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((c) => c.categoryCode));
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  // Filter data
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data
      .map((category) => {
        // Filter by selected categories (only if some are selected)
        if (
          selectedCategories.length > 0 &&
          selectedCategories.length < categories.length &&
          !selectedCategories.includes(category.categoryCode)
        ) {
          return null;
        }

        // Filter items
        const filteredItems = category.items.filter((item) => {
          // Filter by search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
              item.code.toLowerCase().includes(query) ||
              item.name.toLowerCase().includes(query) ||
              item.description?.toLowerCase().includes(query);

            if (!matchesSearch) return false;
          }

          // Filter by active status
          if (!showInactive && !item.active) {
            return false;
          }

          return true;
        });

        return {
          ...category,
          items: filteredItems,
        };
      })
      .filter((c) => c !== null) as MenuCategoryWithItems[];
  }, [data, searchQuery, selectedCategories, showInactive, categories.length]);

  // Flatten items for table display
  const flattenedItems = useMemo(() => {
    return filteredData.flatMap((category) => category.items);
  }, [filteredData]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    handleCategoryToggle,
    handleSelectAll,
    handleClearFilters,
    showInactive,
    setShowInactive,
    filteredData,
    flattenedItems,
    categories,
  };
}
