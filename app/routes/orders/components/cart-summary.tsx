import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { hasRole } from "~/lib/auth/bouncer";
import { UserRole } from "~/lib/auth/roles";
import { formatMoney } from "~/lib/utils";

type CartSummaryProps = {
  itemCount: number;
  subtotal: number;
  notes: string | null;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onClearCart: () => void;
  isInvalid?: boolean;
};

export default function CartSummary({
  itemCount,
  subtotal,
  notes,
  onNotesChange,
  onConfirm,
  onClearCart,
  isInvalid,
}: CartSummaryProps) {
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
          disabled={
            isInvalid || !hasRole(AuthLoader.getUser(), UserRole.Receptionist)
          }
        >
          Xác nhận
        </Button>
        <Button variant="outline" className="w-full " onClick={onClearCart}>
          Xóa đơn hàng
        </Button>
      </div>
    </div>
  );
}
