import {
  format,
  parseISO,
  addDays,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Calendar } from "~/components/ui/calendar";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Textarea } from "~/components/ui/textarea";
import { cn, formatMoney } from "~/lib/utils";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { useServiceOrderStore } from "~/store/service-order.store";

interface OrderItemCardProps {
  itemId: string;
  itemName: string;
  unitPrice: number;
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export default function OrderItemCard({
  itemId,
  itemName,
  unitPrice,
  checkinDate,
  checkoutDate,
}: OrderItemCardProps) {
  const item = useServiceOrderStore((s) =>
    s.services.find((service) => service.itemId === itemId)
  );
  const { setNote, setScheduledDate, setQuantity, removeById } =
    useServiceOrderStore.getState();

  const [noteOpen, setNoteOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  if (!item) return null;

  const { quantity, note, scheduledDate } = item;
  const subtotal = unitPrice * quantity;

  // helpers to convert inputs to Date or undefined
  const toDate = (d?: Date | string) => {
    if (!d) return undefined;
    return typeof d === "string" ? parseISO(d) : new Date(d);
  };

  const start = checkinDate ? startOfDay(toDate(checkinDate)!) : undefined;
  const end = checkoutDate ? endOfDay(toDate(checkoutDate)!) : undefined;

  const clamp = (date: Date, min?: Date, max?: Date) => {
    if (min && isBefore(date, min)) return min;
    if (max && isAfter(date, max)) return max;
    return date;
  };

  // Set default scheduled date to a clamped value on mount if not set
  useEffect(() => {
    if (!scheduledDate) {
      const base = start ?? clamp(new Date(), undefined, end);
      if (base) {
        const defaultDate = format(base, "yyyy-MM-dd");
        setScheduledDate(itemId, defaultDate);
      }
    } else {
      // If store has scheduledDate but it's out of bounds, clamp & update
      const stored = parseISO(scheduledDate);
      const clamped = clamp(stored, start, end);
      if (clamped.getTime() !== stored.getTime()) {
        setScheduledDate(itemId, format(clamped, "yyyy-MM-dd"));
      }
    }
  }, [scheduledDate, checkinDate, checkoutDate, itemId, setScheduledDate]);

  const handleNoteChange = (newNote: string) => {
    setNote(itemId, newNote);
  };

  const handleScheduledDateChange = (date: Date | undefined) => {
    if (date) {
      // clamp again defensively
      const clamped = clamp(date, start, end);
      setScheduledDate(itemId, format(clamped, "yyyy-MM-dd"));
      setDateOpen(false);
    }
  };

  const handleQuantityChange = (newQty: number) => {
    if (newQty <= 0) {
      removeById(itemId);
    } else {
      setQuantity(itemId, newQty);
    }
  };

  return (
    <Card className="shadow-sm p-0 transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-none truncate">
              {itemName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatMoney(unitPrice).vndFormatted} / món
            </p>
          </div>
          <div>
            <Popover open={noteOpen} onOpenChange={setNoteOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={note ? "default" : "outline"}
                  size="sm"
                  className="w-full shadow-sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {note ? "Đã có ghi chú" : "Thêm ghi chú"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 space-y-3" align="start">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Ngày thực hiện
                  </Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate
                          ? format(parseISO(scheduledDate), "dd/MM/yyyy", {
                              locale: vi,
                            })
                          : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          scheduledDate ? parseISO(scheduledDate) : undefined
                        }
                        defaultMonth={
                          scheduledDate
                            ? parseISO(scheduledDate)
                            : (start ?? (end ? end : undefined))
                        }
                        onSelect={handleScheduledDateChange}
                        disabled={(date: Date) => {
                          if (start && isBefore(startOfDay(date), start)) {
                            return true;
                          }
                          if (end && isAfter(endOfDay(date), end)) {
                            return true;
                          }
                          return false;
                        }}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Ghi chú cho dịch vụ
                  </Label>
                  <Textarea
                    value={note || ""}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder="Ví dụ: Không hành, ít cay, phục vụ lúc 8h sáng..."
                    className="resize-none text-sm"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNoteOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button size="sm" onClick={() => setNoteOpen(false)}>
                    Lưu
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Số lượng:</Label>
            <Counter
              className="w-28"
              value={quantity}
              onChange={handleQuantityChange}
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Tổng</p>
            <p className="text-base font-bold text-primary">
              {formatMoney(subtotal).vndFormatted}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
