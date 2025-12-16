import type { Route } from "./+types/menu";
import MenuDataTable from "./components/menu-list";

import { AuthLoader, Permission, RouteModule } from "~/lib/auth/auth.loader";
import useMenuFilters from "./container/menu/filter.hooks";
import { useMenuList } from "./container/menu/query.hooks";
import MenuViewLayout from "./layouts/menu-view.layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Thực Đơn - NOVA Hotel Management" },
    { name: "description", content: "Quản lý thực đơn và món ăn" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Menu, Permission.Read);

export default function Component({}: Route.ComponentProps) {
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
