import { CalendarIcon, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { cn, formatMoney } from "~/lib/utils";
import { useServiceOrderStore } from "~/store/service-order.store";
import { Calendar } from "~/components/ui/calendar";
import { useCreateBookingStore } from "~/store/create-booking.store";

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
  const { setNote, setScheduledDate, removeById } =
    useServiceOrderStore.getState();

  if (!item) return null;

  const { quantity, note, scheduledDate } = item;

  const [noteOpen, setNoteOpen] = useState(false);
  const subtotal = unitPrice * quantity;

  // Handler functions using store methods
  const handleNoteChange = (newNote: string) => {
    setNote(itemId, newNote);
  };

  const handleScheduledDateChange = (date: string) => {
    setScheduledDate(itemId, date);
  };

  const handleRemove = () => {
    removeById(itemId);
  };

  return (
    <div className="flex items-start justify-between py-4 border-b last:border-0">
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-none">{itemName}</p>
            <p className="text-xs text-muted-foreground">
              {formatMoney(unitPrice).vndFormatted}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">
            {formatMoney(subtotal).vndFormatted}
          </span>
        </div>

        {/* Actions: Note + Date */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Note Popover */}
          <Popover open={noteOpen} onOpenChange={setNoteOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={note ? "default" : "info-outline"}
                size="sm"
                className="h-8 text-xs gap-1"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {note ? "Có ghi chú" : "Thêm ghi chú"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 space-y-3" align="start">
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Ghi chú cho dịch vụ
                </Label>
                <Textarea
                  value={note || ""}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Ví dụ: Không hành, ít cay..."
                  className="resize-none text-sm"
                  rows={3}
                />
                <Label className="text-xs font-medium">
                  Thời gian phục vụ dịch vụ
                </Label>
                <Popover>
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
                        ? `Đã chọn ${scheduledDate}`
                        : "Chọn ngày phục vụ"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        scheduledDate ? new Date(scheduledDate) : undefined
                      }
                      disabled={(date: Date) => {
                        if (data.checkinDate) {
                          const checkinDate = parseISO(
                            data.checkinDate as string
                          );
                          if (date < checkinDate) {
                            return true;
                          }
                        }

                        if (data.checkoutDate) {
                          const checkoutDate = parseISO(
                            data.checkoutDate as string
                          );
                          if (date > checkoutDate) {
                            return true;
                          }
                        }

                        return false;
                      }}
                      onSelect={(value) =>
                        handleScheduledDateChange(
                          value ? format(value, "yyyy-MM-dd") : ""
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setNoteOpen(false)}>
                  Xong
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
