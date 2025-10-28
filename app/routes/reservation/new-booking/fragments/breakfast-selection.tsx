import { Calendar as CalendarIcon, Coffee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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
  const handleToggleDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const exists = breakfastDates.some(
      (d) => format(d, "yyyy-MM-dd") === dateString
    );

    if (exists) {
      onSelectDates(
        breakfastDates.filter((d) => format(d, "yyyy-MM-dd") !== dateString)
      );
    } else {
      onSelectDates([...breakfastDates, date]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Bữa sáng</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle all breakfast */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="space-y-1">
            <Label htmlFor="breakfast-all" className="text-base font-medium">
              Bữa sáng cho tất cả các ngày
            </Label>
            <p className="text-sm text-muted-foreground">
              Áp dụng cho {nights} ngày lưu trú
            </p>
          </div>
          <Switch
            id="breakfast-all"
            checked={isBreakfastAll}
            onCheckedChange={(checked) => {
              onToggleAll(checked);
              if (!checked) {
                // Clear specific dates when turning off "all"
                onSelectDates([]);
              }
            }}
          />
        </div>

        {/* Specific dates selection (only show if NOT all) */}
        {!isBreakfastAll && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Hoặc chọn ngày cụ thể
              </Label>
              {breakfastDates.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {breakfastDates.length} ngày
                </Badge>
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    breakfastDates.length === 0 && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {breakfastDates.length > 0
                    ? `Đã chọn ${breakfastDates.length} ngày`
                    : "Chọn ngày có bữa sáng"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={breakfastDates}
                  onSelect={(dates) => onSelectDates(dates || [])}
                  disabled={(date) =>
                    date < checkinDate || date >= checkoutDate
                  }
                  fromDate={checkinDate}
                  toDate={checkoutDate}
                  locale={vi}
                />
              </PopoverContent>
            </Popover>

            {breakfastDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {breakfastDates.map((date) => (
                  <Badge
                    key={format(date, "yyyy-MM-dd")}
                    variant="outline"
                    className="text-xs"
                  >
                    {format(date, "dd/MM", { locale: vi })}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          * Giá bữa sáng sẽ được tính vào tổng hóa đơn
        </p>
      </CardContent>
    </Card>
  );
}
