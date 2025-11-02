import { useMemo } from "react";
import type { Route } from "./+types/menu";
import MenuDataTable from "./components/menu-list";

import useMenuFilters from "./container/menu/filter.hooks";
import { useMenuList } from "./container/menu/query.hooks";
import MenuViewLayout from "./layouts/menu-view.layout";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { filters, filterMenuItems, updateFilter, resetFilters } =
    useMenuFilters();
  const { data: menuData, isPending } = useMenuList({
    categoryCode: filters.categoryCode,
    includeInactive: filters.activeFilter !== "active",
  });
  const filteredMenuItems = filterMenuItems(menuData || []);

  return (
    <MenuViewLayout
      totalMenuItems={filteredMenuItems.length}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      filters={filters}
    >
      <MenuDataTable menu={filteredMenuItems} isLoading={isPending} />
    </MenuViewLayout>
  );
}
