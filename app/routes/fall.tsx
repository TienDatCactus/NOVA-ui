import { AuthLoader } from "~/lib/auth/auth.loader";
import { hasRole } from "~/lib/auth/bouncer";
import { UserRole } from "~/lib/auth/roles";
import { DASHBOARD } from "~/lib/fe-url";
import type { Route } from "./+types/fall";

export const clientLoader = async ({}: Route.LoaderArgs) => {
  const navigate = (path: string) => (window.location.href = path);
  if (hasRole(AuthLoader.getUser(), UserRole.Admin)) {
    navigate(DASHBOARD.auditLogs);
  } else if (hasRole(AuthLoader.getUser(), UserRole.HotelManager)) {
    navigate(DASHBOARD.finances.dashboard);
  } else if (hasRole(AuthLoader.getUser(), UserRole.ServiceStaff)) {
    navigate(DASHBOARD.rooms.list);
  } else if (hasRole(AuthLoader.getUser(), UserRole.Accountant)) {
    navigate(DASHBOARD.expenses);
  } else {
    navigate(DASHBOARD.bookings.list);
  }
  return {};
};
