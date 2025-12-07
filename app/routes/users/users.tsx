import UsersDataTable from "./components/users-list";
import useUserFilters from "./container/filter.hooks";
import { useUsers } from "./container/query.hooks";
import UsersViewLayout from "./layouts/users-view.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Users, Permission.Read);

export default function Component() {
  const { filters, updateFilter, resetFilters } = useUserFilters();
  const { data: users, isPending } = useUsers({
    role: filters.roleFilter == "all" ? undefined : filters.roleFilter,
  });
  return (
    <UsersViewLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalUsers={users?.length || 0}
    >
      <UsersDataTable users={users ?? []} isLoading={isPending} />
    </UsersViewLayout>
  );
}
