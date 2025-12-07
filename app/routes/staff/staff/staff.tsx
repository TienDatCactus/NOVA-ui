import StaffViewLayout from "./layouts/staff-view.layout";

import { useStaffFilters } from "./container/filter.hooks";
import { useStaffList } from "./container/query.hooks";
import StaffDataTable from "./components/staff-list";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Staff, Permission.Read);

export default function StaffPage() {
  const { filters, updateFilter, resetFilter } = useStaffFilters();
  const { data: staffs, isPending } = useStaffList({
    gender: filters.gender,
    role: filters.role,
  });

  return (
    <StaffViewLayout
      totalStaffs={staffs?.length ?? 0}
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilter}
    >
      <StaffDataTable staffs={staffs ?? []} isLoading={isPending} />
    </StaffViewLayout>
  );
}
