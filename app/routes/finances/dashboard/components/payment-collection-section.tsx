import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { PaymentCollectionItemDto } from "~/services/api/finances/dto";

interface PaymentCollectionSectionProps {
  paymentCollection?: PaymentCollectionItemDto[];
  otaReceivable?: number;
}

export function PaymentCollectionSection({
  paymentCollection = [],
  otaReceivable = 0,
}: PaymentCollectionSectionProps) {
  const sortedPayments = [...paymentCollection].sort(
    (a, b) => b.amount - a.amount
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thu tiền theo phương thức</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPayments.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium">{item.methodName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.transactionCount} giao dịch
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {item.amount.toLocaleString("vi-VN")}đ
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}

          {otaReceivable > 0 && (
            <div className="mt-4 rounded-lg bg-muted p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">OTA phải thu</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <p className="text-lg font-bold">
                  {otaReceivable.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
