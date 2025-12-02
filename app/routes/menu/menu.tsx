import { useMemo } from "react";
import type { Route } from "./+types/menu";
import MenuDataTable from "./components/menu-list";

import useMenuFilters from "./container/menu/filter.hooks";
import { useMenuList } from "./container/menu/query.hooks";
import MenuViewLayout from "./layouts/menu-view.layout";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { filters, updateFilter, resetFilters } = useMenuFilters();
  const { data: menuData, isPending } = useMenuList({
    categoryCode: filters.categoryCode || undefined,
    includeInactive: filters.activeFilter === "active",
  });

  return (
    <MenuViewLayout
      totalMenuItems={menuData?.length ?? 0}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      filters={filters}
    >
      <MenuDataTable menu={menuData ?? []} isLoading={isPending} />
    </MenuViewLayout>
  );
}
