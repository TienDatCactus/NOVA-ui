import { useState } from "react";
import type { Route } from "./+types/menu";
import MenuDataTable from "./components/menu-list";
import CreateMenuDialog from "./components/create-menu.dialog";
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
  const { filters, filterMenuItems, updateFilter, resetFilters, includeInactive } =
    useMenuFilters();
  const { data: menuData, isPending } = useMenuList({
    categoryCode: filters.categoryCode,
    includeInactive,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const filteredMenuItems = filterMenuItems(menuData || []);

  return (
    <MenuViewLayout
      totalMenuItems={filteredMenuItems.length}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      filters={filters}
      onAddMenuItem={() => setCreateDialogOpen(true)}
    >
      <MenuDataTable menu={filteredMenuItems} isLoading={isPending} />

      <CreateMenuDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </MenuViewLayout>
  );
}
