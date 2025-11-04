import { MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { formatMoney } from "~/lib/utils";
import { useDeleteItemFromPOSOrder } from "../container/pos-orders-mutation.hooks";
import type { POSOrderItemDto } from "~/services/api/order/dto";

interface PosItemRowProps {
  item: POSOrderItemDto;
  orderId: string;
  isEditable: boolean;
}

/**
 * Enhanced POS item row with note support
 * Inspired by order-item.card.tsx pattern
 */
export default function PosItemRow({
  item,
  orderId,
  isEditable,
}: PosItemRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [localNote, setLocalNote] = useState("");

  const deleteItemMutation = useDeleteItemFromPOSOrder();
  const subtotal = item.unitPrice * item.quantity;

  const handleDelete = async () => {
    if (!isEditable) return;

    setIsDeleting(true);
    try {
      await deleteItemMutation.mutateAsync({
        orderId,
        itemId: item.id,
      });
    } catch (error) {
      console.error("Failed to delete item:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`flex items-start justify-between py-4 border-b last:border-0 transition-all ${
        isDeleting ? "opacity-50" : "opacity-100"
      } ${!isEditable ? "bg-muted/5" : ""}`}
    >
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-none">
              {item.menuItemName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatMoney(item.unitPrice).vndFormatted}
            </p>
          </div>
          {isEditable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleDelete}
              disabled={isDeleting || deleteItemMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quantity & Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Số lượng: {item.quantity}
          </span>
          <span className="text-sm font-semibold">
            {formatMoney(subtotal).vndFormatted}
          </span>
        </div>

        {/* Note Action */}
        {isEditable && (
          <div className="flex items-center gap-2">
            <Popover open={noteOpen} onOpenChange={setNoteOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={localNote ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {localNote ? "Có ghi chú" : "Thêm ghi chú"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 space-y-3" align="start">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Ghi chú cho món ăn
                  </Label>
                  <Textarea
                    value={localNote}
                    onChange={(e) => setLocalNote(e.target.value)}
                    placeholder="Ví dụ: Không hành, ít cay..."
                    className="resize-none text-sm"
                    rows={3}
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
        )}
      </div>
    </div>
  );
}
