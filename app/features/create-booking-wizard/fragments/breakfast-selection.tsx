import { addDays, eachDayOfInterval, format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, Coffee } from "lucide-react";
import { useMemo } from "react";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { DatePicker } from "~/components/ui/date-picker";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";

interface BreakfastSelectionProps {
  isBreakfastAll: boolean;
  breakfastDates: Date[];
  onToggleAll: (value: boolean) => void;
  onSelectDates: (dates: Date[]) => void;
  checkinDate: Date;
  checkoutDate: Date;
  nights: number;
}

export function BreakfastSelection({
  isBreakfastAll,
  breakfastDates,
  onToggleAll,
  onSelectDates,
  checkinDate,
  checkoutDate,
  nights,
}: BreakfastSelectionProps) {
  const availableDates = useMemo(() => {
    if (!checkinDate || !checkoutDate || nights <= 0) return [];
    try {
      return eachDayOfInterval({
        start: addDays(checkinDate, 1), // Morning after checkin
        end: checkoutDate,
      });
    } catch (e) {
      return [];
    }
  }, [checkinDate, checkoutDate, nights]);

  const isLongStay = availableDates.length > 14;

  const handleToggleDate = (date: Date) => {
    if (isBreakfastAll) return; // Disable manual toggle if "All" is active

    const exists = breakfastDates.find((d) => isSameDay(d, date));
    let newDates: Date[];

    if (exists) {
      newDates = breakfastDates.filter((d) => !isSameDay(d, date));
    } else {
      newDates = [...breakfastDates, date];
    }
    onSelectDates(newDates);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* === CONTROL ROW === */}
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-primary shadow-sm dark:bg-primary/10">
            <Coffee className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <Label
              htmlFor="breakfast-all"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Bữa sáng mỗi ngày
            </Label>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Áp dụng {nights} đêm
            </p>
          </div>
        </div>
        <Switch
          id="breakfast-all"
          className="data-[state=checked]:bg-primary"
          checked={isBreakfastAll}
          onCheckedChange={(checked) => {
            onToggleAll(checked);
            // Optional: If turning ON, we might want to visually select all dates for feedback
            // If turning OFF, we clear or keep last selection.
            if (!checked) onSelectDates([]);
          }}
        />
      </div>

      {/* === DATE SELECTION UI === */}
      <div
        className={cn(
          "space-y-3 transition-opacity duration-200",
          isBreakfastAll && "opacity-50 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">
            {isBreakfastAll
              ? "Đã bao gồm tất cả các ngày"
              : "Hoặc chọn ngày cụ thể:"}
          </Label>

          {!isBreakfastAll && breakfastDates.length > 0 && (
            <span className="text-xs font-medium text-primary">
              {breakfastDates.length} ngày đã chọn
            </span>
          )}
        </div>

        {isLongStay ? (
          /* FALLBACK: CALENDAR POPOVER FOR LONG STAYS */
          <DatePicker
            mode="multiple"
            selected={breakfastDates}
            onSelect={(dates) => onSelectDates(dates || [])}
            disabled={(date) => date <= checkinDate || date > checkoutDate}
            locale={vi}
          />
        ) : (
          /* MODERN: DIRECT SELECTION GRID */
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
            {availableDates.map((date) => {
              // Check if selected either manually OR because "All" is active
              const isSelected =
                isBreakfastAll ||
                breakfastDates.some((d) => isSameDay(d, date));

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleToggleDate(date)}
                  className={cn(
                    "group relative flex flex-col items-center justify-center rounded-md border p-2 text-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  <span className="text-[10px] uppercase text-muted-foreground font-medium mb-0.5">
                    {format(date, "EEE", { locale: vi })}
                  </span>
                  <span className="text-sm font-bold font-mono">
                    {format(date, "dd/MM")}
                  </span>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-in zoom-in" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Hint / Footer */}
      {!isBreakfastAll && breakfastDates.length === 0 && (
        <p className="text-[10px] text-muted-foreground italic pl-1">
          * Khách chưa chọn bữa sáng nào.
        </p>
      )}
    </div>
  );
}
