import type { Route } from "./+types/new";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";
import { useCreatePOSOrder } from "./container/pos-orders-mutation.hooks";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const [invoiceId, setInvoiceId] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [note, setNote] = useState("");

  const createPOSOrder = useCreatePOSOrder();

  const handleCreate = async () => {
    if (!invoiceId) {
      return;
    }

    try {
      const result = await createPOSOrder.mutateAsync({
        invoiceId,
        customerId: "temp-customer-id", // TODO: Get from invoice or form
      });

      // Navigate to the new order detail page
      if (result.posOrderId) {
        navigate(`/dashboard/pos-orders/${result.posOrderId}`);
      }
    } catch (error) {
      // Error already handled by mutation hook
      console.error("Failed to create POS order:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/pos-orders")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tạo đơn hàng POS mới</h1>
          <p className="text-sm text-muted-foreground">
            Chọn hóa đơn để bắt đầu thêm món
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin đơn hàng</CardTitle>
          <CardDescription>
            Nhập thông tin cơ bản để tạo đơn hàng mới
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Selection */}
          <div className="space-y-2">
            <Label htmlFor="invoice">
              Hóa đơn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invoice"
              placeholder="Nhập mã hóa đơn..."
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Nhập mã hóa đơn của khách hàng (bắt buộc)
            </p>
          </div>

          {/* Table Number (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="table">Số bàn</Label>
            <Input
              id="table"
              placeholder="Nhập số bàn (tùy chọn)..."
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Số bàn/phòng nếu phục vụ tại chỗ
            </p>
          </div>

          {/* Note (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Input
              id="note"
              placeholder="Ghi chú đặc biệt (tùy chọn)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/pos-orders")}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!invoiceId || createPOSOrder.isPending}
          >
            {createPOSOrder.isPending ? (
              <>Đang tạo...</>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Tạo đơn hàng
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
