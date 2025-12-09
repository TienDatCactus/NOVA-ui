import HolidaysList from "./components/holidays-list";
import { useHolidayList } from "./container/query.hooks";
import HolidaysViewLayout from "./layouts/holidays-view.layout";
import type { Route } from "./+types/holidays";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ngày Nghỉ Lễ - NOVA Hotel Management" },
    { name: "description", content: "Quản lý ngày nghỉ lễ và ngày nghỉ phép" },
  ];
}

export default function Holidays() {
  const { data: holidays, isPending } = useHolidayList();

  return (
    <HolidaysViewLayout totalHolidays={holidays?.length ?? 0}>
      <HolidaysList holidays={holidays ?? []} isLoading={isPending} />
    </HolidaysViewLayout>
  );
}
