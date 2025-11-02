import type { POSOrderListItemDto } from "~/services/api/order/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";

interface POSOrderListProps {
  orders: POSOrderListItemDto[];
  isLoading?: boolean;
  refetch: () => void;
}

function POSOrderList({ orders, isLoading, refetch }: POSOrderListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShoppingCart />
          </EmptyMedia>
          <EmptyTitle>Chưa có đơn hàng</EmptyTitle>
          <EmptyDescription>
            Không tìm thấy đơn hàng nào. Hãy tạo đơn hàng mới hoặc chọn hóa đơn
            khác.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button>Tạo đơn hàng mới</Button>
            <Button variant="outline" onClick={refetch}>
              Làm mới
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    );
  }

  return <DataTable columns={columns} data={orders} />;
}

export default POSOrderList;
