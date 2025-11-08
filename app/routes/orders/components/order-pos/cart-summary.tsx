import { Hotel, ShoppingCart, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { formatMoney } from "~/lib/utils";

type CartSummaryProps = {
  itemCount: number;
  subtotal: number;
  isEmpty: boolean;
  notes: string | null;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onClearCart: () => void;
};

export default function CartSummary({
  itemCount,
  subtotal,
  isEmpty,
  notes,
  onNotesChange,
  onConfirm,
  onClearCart,
}: CartSummaryProps) {
  if (isEmpty) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle className="font-semibold">Giỏ hàng trống</EmptyTitle>
          <EmptyDescription className="text-sm text-muted-foreground">
            Vui lòng chọn món từ thực đơn
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <div className="space-y-2">
      {/* Notes section */}
      <div className="space-y-2">
        <Label htmlFor="order-notes" className="text-sm text-muted-foreground">
          Ghi chú (tùy chọn)
        </Label>
        <Textarea
          id="order-notes"
          placeholder="Thêm ghi chú cho đơn hàng..."
          value={notes || ""}
          onChange={(e) => onNotesChange(e.target.value)}
          className="max-h-20 resize-none"
          rows={2}
          maxLength={500}
        />
        {notes && (
          <p className="text-xs text-muted-foreground text-right">
            {notes.length}/500
          </p>
        )}
      </div>

      <Card className="shadow-m py-2 ">
        <CardContent className="space-y-3 px-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Số lượng món</span>
            <span className="font-mono font-semibold">{itemCount}</span>
          </div>

          <Separator />

          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold">Tổng cộng</span>
            <data
              value={subtotal}
              className="text-xl font-bold text-primary font-mono"
            >
              {formatMoney(subtotal).vndFormatted}
            </data>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-2">
        <Button
          className="w-full"
          size="lg"
          onClick={onConfirm}
          disabled={isEmpty}
        >
          Xác nhận
        </Button>
        <Button
          variant="outline"
          className="w-full "
          onClick={onClearCart}
          disabled={isEmpty}
        >
          Xóa đơn hàng
        </Button>
      </div>
    </div>
  );
}
