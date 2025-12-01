import HolidaysList from "./components/holidays-list";
import { useHolidayList } from "./container/query.hooks";
import HolidaysViewLayout from "./layouts/holidays-view.layout";

export default function Holidays() {
  const { data: holidays, isPending } = useHolidayList();

  return (
    <HolidaysViewLayout totalHolidays={holidays?.length ?? 0}>
      <HolidaysList holidays={holidays ?? []} isLoading={isPending} />
    </HolidaysViewLayout>
  );
}
