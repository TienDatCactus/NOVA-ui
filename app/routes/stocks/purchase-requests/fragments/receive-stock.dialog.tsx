import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";
import {
  usePurchaseRequestDetail,
  useReceiveStock,
} from "../container/query.hooks";
import { PurchaseRequestsSchemas } from "~/services/api/stocks/purchase-requests/purchase-requests.schema";
import type { ReceiveStockRequestDto } from "~/services/api/stocks/purchase-requests/dto";
import { useState, useEffect } from "react";

interface ReceiveStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequestId: string;
}

export default function ReceiveStockDialog({
  open,
  onOpenChange,
  purchaseRequestId,
}: ReceiveStockDialogProps) {
  const { data: purchaseRequest, isPending: isLoadingPR } =
    usePurchaseRequestDetail(purchaseRequestId);

  const { mutate: onSubmit, isPending: isSubmitting } = useReceiveStock();

  // Track actual costs locally (keyed by item index or ID)
  const [actualCosts, setActualCosts] = useState<Record<string, number>>({});

  const form = useForm<ReceiveStockRequestDto>({
    resolver: zodResolver(PurchaseRequestsSchemas.ReceiveStockRequestSchema),
    defaultValues: {
      expenseId: null,
      note: "",
      actualCosts: {},
    },
  });

  // Initialize actual costs from purchase request when loaded
  useEffect(() => {
    if (purchaseRequest) {
      const initialCosts: Record<string, number> = {};
      purchaseRequest.items.forEach((item, index) => {
        const key = item.itemId || `temp-${index}`;
        initialCosts[key] = item.unitCost;
      });
      setActualCosts(initialCosts);
      form.setValue("actualCosts", initialCosts);
    }
  }, [purchaseRequest, form]);

  const handleSubmit = (data: ReceiveStockRequestDto) => {
    onSubmit(
      { purchaseRequestId, data },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const updateActualCost = (key: string, cost: number) => {
    const updated = { ...actualCosts, [key]: cost };
    setActualCosts(updated);
    form.setValue("actualCosts", updated);
  };

  if (isLoadingPR) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!purchaseRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-2">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Nhập hàng vào kho</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Số phiếu:{" "}
            <Badge variant="outline" className="font-mono">
              {purchaseRequest.requestNumber}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 overflow-y-auto max-h-[70vh] px-4 pb-4"
          >
            {/* Warning Alert */}
            <Alert variant="default" className="border-orange-500 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-900">
                Lưu ý quan trọng
              </AlertTitle>
              <AlertDescription className="text-orange-800">
                Thao tác này sẽ cập nhật số lượng tồn kho cho tất cả hàng hóa
                trong danh sách. Vui lòng kiểm tra kỹ trước khi xác nhận.
              </AlertDescription>
            </Alert>

            {/* Expense ID */}
            <FormField
              control={form.control}
              name="expenseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã chi phí (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập mã chi phí để liên kết với kế toán..."
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Liên kết với hệ thống kế toán để theo dõi chi phí
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú nhập hàng</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú về quá trình nhập hàng, tình trạng hàng hóa..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Items List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">
                Xác nhận số lượng và giá thực tế
              </h3>

              <div className="space-y-4">
                {purchaseRequest.items.map((item, index) => {
                  const itemKey = item.itemId || `temp-${index}`;
                  const estimatedCost = item.unitCost;
                  const estimatedTotal = estimatedCost * item.quantity;
                  const currentActualCost =
                    actualCosts[itemKey] || estimatedCost;
                  const actualTotal = currentActualCost * item.quantity;

                  return (
                    <div
                      key={itemKey}
                      className="border rounded-lg p-4 space-y-3 bg-card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <h4 className="font-semibold">
                              {item.freeTextItemName}
                            </h4>
                          </div>
                          {item.freeTextItemDescription && (
                            <p className="text-sm text-muted-foreground">
                              {item.freeTextItemDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        {/* Quantity (Read-only) */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Số lượng
                          </label>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">
                              {item.quantity}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {item.freeTextUnitName || "đơn vị"}
                            </span>
                          </div>
                        </div>

                        {/* Actual Cost Input */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Giá thực tế (đơn vị)
                            <span className="text-destructive ml-1">*</span>
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={currentActualCost}
                            onChange={(e) =>
                              updateActualCost(
                                itemKey,
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Dự kiến: {estimatedCost.toLocaleString("vi-VN")} đ
                          </p>
                        </div>

                        {/* Total (Calculated) */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Tổng giá trị
                          </label>
                          <div className="space-y-1">
                            <p className="text-xl font-semibold text-primary">
                              {actualTotal.toLocaleString("vi-VN")} đ
                            </p>
                            <p className="text-xs text-muted-foreground">
                              So với dự kiến:{" "}
                              {estimatedTotal.toLocaleString("vi-VN")} đ
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tổng giá trị dự kiến:
                  </span>
                  <span className="font-medium">
                    {purchaseRequest.items
                      .reduce(
                        (sum, item) => sum + item.unitCost * item.quantity,
                        0
                      )
                      .toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Tổng giá trị thực tế:</span>
                  <span className="text-primary">
                    {purchaseRequest.items
                      .reduce((sum, item, index) => {
                        const itemKey = item.itemId || `temp-${index}`;
                        const cost = actualCosts[itemKey] || item.unitCost;
                        return sum + cost * item.quantity;
                      }, 0)
                      .toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>
              </div>
            </div>
          </form>
        </Form>

        <DialogFooter className="px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang nhập kho...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Xác nhận nhập kho
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
