"use client";

import { Wallet } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney, handleLimitInput } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { ReviewPaymentFormData } from "~/services/types/forms.types";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
const { BookingSourceEnum } = BookingSchema;

interface BookingPaymentProps {
  form: UseFormReturn<ReviewPaymentFormData>;
  totalAmount: number;
  sourceType?: z.infer<typeof BookingSourceEnum>;
  isLoadingPrice?: boolean;
}

export function BookingPayment({
  form,
  totalAmount,
  sourceType,
  isLoadingPrice = false,
}: BookingPaymentProps) {
  const paidAmount = Number(form.watch("roomPayment.paidAmount") ?? 0);

  const remaining = totalAmount - paidAmount;
  const change = paidAmount > totalAmount ? paidAmount - totalAmount : 0;
  console.log(form.getValues("roomPayment"));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Method */}
        <FormField
          control={form.control}
          name="roomPayment.paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phương thức thanh toán</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <SelectItem
                        key={method.value}
                        value={method.value}
                        disabled={method.disabled}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {method.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {sourceType === "OTA" && (
                <FormDescription>
                  Đặt phòng qua OTA - khuyến nghị OTA thu hộ
                </FormDescription>
              )}
              {sourceType === "Agency" && (
                <FormDescription>
                  Đặt qua đại lý - khuyến nghị ghi nợ
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roomPayment.paidAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền thanh toán (VNĐ)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  onInput={handleLimitInput}
                  placeholder="0"
                  min={0}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = Number(value);
                    field.onChange(isNaN(num) || value === "" ? 0 : num);
                  }}
                />
              </FormControl>
              <FormDescription>
                Để trống hoặc nhập 0 nếu chưa thanh toán
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Note */}
        <FormField
          control={form.control}
          name="roomPayment.paymentNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú thanh toán (tùy chọn)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="VD: Đặt cọc 50%, thanh toán khi check-in"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Payment Summary */}
        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold text-sm">Tóm tắt thanh toán</h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng tiền</span>
              {isLoadingPrice ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <span className="font-bold truncate line-clamp-1 w-20">
                  {formatMoney(totalAmount).vndFormatted}
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Đã thanh toán</span>
              <span className="font-semibold text-green-600 truncate">
                {Number.isFinite(Number(paidAmount))
                  ? formatMoney(paidAmount).vndFormatted
                  : "0đ"}
              </span>
            </div>

            <Separator />

            {remaining > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Còn lại</span>
                <div className="text-right">
                  {isLoadingPrice ? (
                    <Skeleton className="h-5 w-24" />
                  ) : (
                    <>
                      <p className="font-bold text-orange-600 truncate line-clamp-1 w-20">
                        {formatMoney(remaining).vndFormatted}
                      </p>
                      <Badge variant="warning" className="text-xs mt-1">
                        Chưa thanh toán
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            )}

            {change > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Trả lại khách</span>
                <div className="text-right">
                  <p className="font-bold text-blue-600 truncate">
                    {formatMoney(change).vndFormatted}
                  </p>
                  <Badge variant="info" className="text-xs mt-1">
                    Thối lại
                  </Badge>
                </div>
              </div>
            )}

            {paidAmount === totalAmount && paidAmount > 0 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Badge variant="success" className="text-xs">
                  ✓ Đã thanh toán đủ
                </Badge>
              </div>
            )}
          </div>

          {/* Payment Status Hint */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p className="font-medium mb-1">Trạng thái thanh toán:</p>
            {paidAmount === 0 && <p>• Unpaid - Chưa thanh toán</p>}
            {paidAmount > 0 && paidAmount < totalAmount && (
              <p>• PartiallyPaid - Đã thanh toán một phần</p>
            )}
            {paidAmount === totalAmount && paidAmount > 0 && (
              <p>• Paid - Đã thanh toán đủ</p>
            )}
            {paidAmount > totalAmount && (
              <p>• Overpaid - Thu thừa (cần trả lại khách)</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
