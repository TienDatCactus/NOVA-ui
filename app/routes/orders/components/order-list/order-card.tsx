import { Badge } from "~/components/ui/badge";
import { Card, CardHeader } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { formatMoney } from "~/lib/utils";
import type { POSOrderDetailDto } from "~/services/api/orders/dto";
import { ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import OrderItemsList from "./order-items-list";
import OrderActions from "./order-actions";
import { cn } from "~/lib/utils";

interface OrderCardProps {
  order: POSOrderDetailDto;
}

const statusConfig = {
  Open: {
    label: "Mở",
    className: "bg-primary text-primary-foreground",
  },
  Completed: {
    label: "Hoàn thành",
    className: "bg-green-500 text-white",
  },
  Cancelled: {
    label: "Đã hủy",
    className: "bg-destructive text-destructive-foreground",
  },
};

export default function OrderCard({ order }: OrderCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = order?.items?.length;
  const statusInfo = statusConfig[order.status];
  console.log(order);
  return (
    <Card>
      <CardHeader>
        <div>
          <div>
            <h3>Ngày tạo</h3>
            <p>
              {format(parseISO(order?.createdAt ?? ""), "dd/MMM/yyyy", {
                locale: vi,
              })}
            </p>
          </div>
          <div>
            <h3>Tổng tiền</h3>
            <p>{formatMoney(order.totalAmount ?? 0).vndFormatted}</p>
          </div>
          <div>
            <h3>Trạng thái</h3>
            <p>
              <Badge>{statusInfo.label}</Badge>
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
const dat = {
  id: "f19c0964-ef5b-423b-bdef-62b9c5063338",
  status: "Open",
  totalAmount: 450000,
  customerId: null,
  invoiceId: null,
  createdAt: "2025-11-08T09:33:04.1794839",
  items: [
    {
      id: "ea677405-03f5-4559-a5af-9c1425c76084",
      menuItemId: "b81df381-fc0c-42ca-99f8-4612616f935d",
      itemName: "Cơm chiên hải sản",
      quantity: 1,
      unitPrice: 120000,
      servedAt: null,
      subtotal: 120000,
    },
    {
      id: "d90ffdf5-cc80-4dff-8907-fa1250b946cb",
      menuItemId: "0048c648-2462-4bd6-a8b6-1aecaa11d143",
      itemName: "Mì xào bò",
      quantity: 3,
      unitPrice: 110000,
      servedAt: null,
      subtotal: 330000,
    },
  ],
};
