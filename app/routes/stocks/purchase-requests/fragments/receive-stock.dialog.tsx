import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { formatMoney, onError } from "~/lib/utils";
import type { ReceiveStockRequestDto } from "~/services/api/stocks/purchase-requests/dto";
import { PurchaseRequestsSchemas } from "~/services/api/stocks/purchase-requests/purchase-requests.schema";
import {
  usePurchaseRequestDetail,
  useReceiveStock,
} from "../container/query.hooks";

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

  const form = useForm<ReceiveStockRequestDto>({
    resolver: zodResolver(PurchaseRequestsSchemas.ReceiveStockRequestSchema),
    defaultValues: {
      note: "",
      actualCosts: {},
    },
  });

  useEffect(() => {
    if (purchaseRequest && open) {
      const initialCosts: Record<string, number> = {};
      purchaseRequest.items.forEach((item) => {
        initialCosts[item.id] = item.unitCost;
      });
      form.reset({
        note: "",
        actualCosts: initialCosts,
      });
    } else if (!open) {
      form.reset({
        note: "",
        actualCosts: {},
      });
    }
  }, [purchaseRequest, open, form]);

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

  // Watch actualCosts to calculate totals
  const actualCosts = form.watch("actualCosts") || {};

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2">
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
            onSubmit={form.handleSubmit(handleSubmit, onError)}
            className="space-y-6  px-4 pb-4"
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
                      onChange={(e) => field.onChange(e.target.value)}
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
                  const estimatedCost = item.unitCost;
                  const estimatedTotal = estimatedCost * item.quantity;
                  const currentActualCost =
                    actualCosts[item.id] || estimatedCost;
                  const actualTotal = currentActualCost * item.quantity;

                  return (
                    <div
                      key={item.id}
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
                          <Label className="text-sm font-medium">
                            Số lượng
                          </Label>
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
                        <FormField
                          control={form.control}
                          name={`actualCosts.${item.id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Giá thực tế (đơn vị)
                                <span className="text-destructive ml-1">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={estimatedCost.toLocaleString(
                                    "vi-VN"
                                  )}
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Dự kiến:{" "}
                                {formatMoney(estimatedCost).vndFormatted}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Total (Calculated) */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Tổng giá trị
                          </Label>
                          <div className="space-y-1">
                            <p className="text-xl font-semibold text-primary">
                              {formatMoney(actualTotal).vndFormatted}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Dự kiến:{" "}
                              {formatMoney(estimatedTotal).vndFormatted}
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
                    {
                      formatMoney(
                        purchaseRequest.items.reduce(
                          (sum, item) => sum + item.unitCost * item.quantity,
                          0
                        )
                      ).vndFormatted
                    }
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Tổng giá trị thực tế:</span>
                  <span className="text-primary">
                    {
                      formatMoney(
                        purchaseRequest.items.reduce((sum, item) => {
                          const cost = actualCosts[item.id] || item.unitCost;
                          return sum + cost * item.quantity;
                        }, 0)
                      ).vndFormatted
                    }
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
