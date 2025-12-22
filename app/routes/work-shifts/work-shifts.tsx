import WorkShiftsDataTable from "./components/work-shifts-list";
import { useWorkShiftList } from "./container/query.hooks";
import WorkShiftsViewLayout from "./layouts/work-shifts-view.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";
import type { Route } from "./+types/work-shifts";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ca Làm Việc - NOVA Hotel Management" },
    { name: "description", content: "Quản lý ca làm việc cho nhân viên" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.WorkShifts, Permission.Read);

export default function WorkShifts() {
  const { data: workshifts, isPending } = useWorkShiftList();
  return (
    <WorkShiftsViewLayout totalWorkShifts={workshifts?.length || 0}>
      <WorkShiftsDataTable
        workShifts={workshifts ?? []}
        isLoading={isPending}
      />
    </WorkShiftsViewLayout>
  );
}
