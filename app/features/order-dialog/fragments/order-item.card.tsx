import { MessageSquare, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { formatMoney } from "~/lib/utils";

interface OrderItemCardProps {
  itemName: string;
  unitPrice: number;
  quantity: number;
  note: string | null;
  scheduledDate: string;
  onQuantityChange: (newQuantity: number) => void;
  onNoteChange: (note: string) => void;
  onScheduledDateChange: (date: string) => void;
  onRemove: () => void;
}

/**
 * Minimal order item card for restaurant-style order summary
 */
export default function OrderItemCard({
  itemName,
  unitPrice,
  quantity,
  note,
  scheduledDate,
  onQuantityChange,
  onNoteChange,
  onScheduledDateChange,
  onRemove,
}: OrderItemCardProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const subtotal = unitPrice * quantity;

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
            onClick={onRemove}
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
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="Ví dụ: Không hành, ít cay..."
                  className="resize-none text-sm"
                  rows={3}
                />{" "}
                <Label className="text-xs font-medium">
                  Thời gian phục vụ dịch vụ
                </Label>
                <DatePicker
                  value={scheduledDate ? parseISO(scheduledDate) : undefined}
                  onChange={(value) =>
                    onScheduledDateChange(
                      value ? format(value, "yyyy-MM-dd") : ""
                    )
                  }
                  className="h-8 text-xs w-32"
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setNoteOpen(false)}>
                  Xong
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Scheduled Date */}
        </div>
      </div>
    </div>
  );
}
