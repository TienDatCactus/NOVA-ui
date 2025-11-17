import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { PackageSearch } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { useServiceOrderStore } from "~/store/service-order.store";
import OrderItemWrapper from "../fragments/order-item-wrapper";
import { Separator } from "~/components/ui/separator";

interface OrderDetailProps {
  customerName?: string;
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export default function OrderDetail({
  customerName,
  checkinDate,
  checkoutDate,
}: OrderDetailProps) {
  const selectedItems = useServiceOrderStore((s) => s.services);
  const itemCount = selectedItems.length;

  return (
    <Card className="flex flex-col h-full p-4 overflow-y-auto flex-1">
      <CardHeader className="p-0">
        <CardTitle>Khách hàng: {customerName}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {checkinDate && checkoutDate
            ? `Từ ${format(new Date(checkinDate), "dd/MM/yyyy", { locale: vi })} đến ${format(
                new Date(checkoutDate),
                "dd/MM/yyyy",
                { locale: vi }
              )}`
            : "Chưa chọn ngày"}
        </CardDescription>
      </CardHeader>
      <Separator />
      <div className="space-y-2 p-2 overflow-y-auto max-h-[50vh] flex-1">
        {selectedItems.length === 0 ? (
          <Empty className="gap-2">
            <EmptyMedia variant={"icon"}>
              <PackageSearch className="h-8 w-8 text-muted-foreground" />
            </EmptyMedia>

            <EmptyTitle>Chưa có món nào</EmptyTitle>

            <EmptyDescription>
              Vui lòng chọn dịch vụ hoặc món ăn
            </EmptyDescription>
          </Empty>
        ) : (
          <div className="space-y-2">
            {selectedItems.map((item) => (
              <OrderItemWrapper
                key={item.itemId}
                itemId={item.itemId}
                checkinDate={checkinDate}
                checkoutDate={checkoutDate}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
