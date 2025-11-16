import { format, parseISO, addDays } from "date-fns";
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
}

/**
 * Minimal order item card connected to global service-order store
 * Reads item state from store and updates via store methods
 */
export default function OrderItemCard({
  itemId,
  itemName,
  unitPrice,
}: OrderItemCardProps) {
  const item = useServiceOrderStore((s) =>
    s.services.find((service) => service.itemId === itemId)
  );
  const { data } = useCreateBookingStore();
  const { setNote, setScheduledDate, setQuantity, removeById } =
    useServiceOrderStore.getState();

  const [noteOpen, setNoteOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  if (!item) return null;

  const { quantity, note, scheduledDate } = item;
  const subtotal = unitPrice * quantity;

  // Set default scheduled date to checkin date + 1 day on mount if not set
  useEffect(() => {
    if (!scheduledDate && data.checkinDate) {
      const defaultDate = format(
        addDays(new Date(data.checkinDate), 1),
        "yyyy-MM-dd"
      );
      setScheduledDate(itemId, defaultDate);
    }
  }, []);

  // Get current scheduled date or default

  // Handler functions
  const handleNoteChange = (newNote: string) => {
    setNote(itemId, newNote);
  };

  const handleScheduledDateChange = (date: Date | undefined) => {
    if (date) {
      setScheduledDate(itemId, format(date, "yyyy-MM-dd"));
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

  const handleRemove = () => {
    removeById(itemId);
  };

  return (
    <Card className="shadow-sm hover:border-primary/50 transition-all">
      <CardContent className="p-4 space-y-3">
        {/* Header Row: Name, Price, Remove */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-none truncate">
              {itemName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatMoney(unitPrice).vndFormatted} / món
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Quantity & Subtotal Row */}
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

        {/* Scheduled Date Row - Always Visible */}
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
                defaultMonth={
                  data.checkinDate ? new Date(data.checkinDate) : undefined
                }
                selected={
                  scheduledDate
                    ? parseISO(scheduledDate)
                    : addDays(new Date(data.checkinDate!), 1)
                }
                onSelect={handleScheduledDateChange}
                disabled={(date: Date) => {
                  if (data.checkinDate && date < new Date(data.checkinDate)) {
                    return true;
                  }
                  if (data.checkoutDate && date > new Date(data.checkoutDate)) {
                    return true;
                  }
                  return false;
                }}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Note Button */}
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
              <Label className="text-sm font-medium">Ghi chú cho dịch vụ</Label>
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
      </CardContent>
    </Card>
  );
}
