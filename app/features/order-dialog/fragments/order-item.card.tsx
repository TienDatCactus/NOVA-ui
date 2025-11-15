import { format, parseISO } from "date-fns";
import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Textarea } from "~/components/ui/textarea";
import { formatMoney } from "~/lib/utils";
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
    <Card className="hover:border-primary transition-colors p-0">
      <CardContent className="flex-1 flex justify-between items-center min-w-0 p-4">
        <div className="flex flex-col items-start justify-between gap-2">
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">
              {itemName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatMoney(unitPrice).vndFormatted}
            </p>
          </div>
          <Counter
            className="w-30"
            value={quantity}
            onChange={handleQuantityChange}
          />
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold text-primary ml-auto">
            {formatMoney(subtotal).vndFormatted}
          </p>
          <Popover open={noteOpen} onOpenChange={setNoteOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={note ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs gap-1"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {note ? "Đã ghi chú" : "Ghi chú"}
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
                <DatePicker
                  mode="single"
                  value={
                    scheduledDate ? parseISO(scheduledDate) : data.checkoutDate!
                  }
                  disabled={(date: Date) => {
                    if (data.checkinDate) {
                      if (date < data.checkinDate) {
                        return true;
                      }
                    }

                    if (data.checkoutDate) {
                      if (date > data.checkoutDate) {
                        return true;
                      }
                    }

                    return false;
                  }}
                  onChange={(value) =>
                    handleScheduledDateChange(
                      value ? format(value, "yyyy-MM-dd") : ""
                    )
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setNoteOpen(false)}>
                  Xong
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
