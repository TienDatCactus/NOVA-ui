import StaffRolesListView from "./components/staff-roles-list-view";
import { useStaffRoleList } from "./container/query.hooks";
import StaffRoleLayout from "./layouts/staff-role.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.StaffRoles, Permission.Read);

export default function StaffRoleRoute() {
  const { data: roles, isPending } = useStaffRoleList();

  return (
    <StaffRoleLayout totalRoles={roles?.length ?? 0}>
      <StaffRolesListView roles={roles || []} isLoading={isPending} />
    </StaffRoleLayout>
  );
}
