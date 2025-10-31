import { Separator } from "@radix-ui/react-select";
import { vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  return (
    <Card className="grid gap-2 py-4">
      <CardHeader className="">
        <p className="uppercase text-muted-foreground font-medium">
          Khoảng ngày
        </p>
      </CardHeader>
      <CardContent className="p-0 border">
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={{ from: value.from, to: value.to }}
          onSelect={(r) => onChange({ from: r?.from, to: r?.to })}
          numberOfMonths={2}
          disabled={{ before: new Date() }}
          className="w-full"
          locale={vi}
        />
      </CardContent>
    </Card>
  );
}
export default DateRangePicker;
