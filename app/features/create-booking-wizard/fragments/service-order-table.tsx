import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { NotepadText, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { useServiceDetail } from "~/routes/services/container/services/query.hooks";
import { useMenuItemDetail } from "~/routes/menu/container/menu/query.hooks";
import type z from "zod";
import { OrderSchema } from "~/services/api/orders/order.schema";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const { ServiceOrderItemSchema } = OrderSchema;
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;

interface ServiceOrderTableProps {
  services: ServiceOrderItemDto[];
  onRemove: (itemId: string) => void;
  invalidServiceIds?: string[];
}

interface ServiceOrderItemRowProps {
  service: ServiceOrderItemDto;
  onRemove: () => void;
  isInvalid?: boolean;
}

/**
 * Individual service order item row that fetches its own details
 * Handles both service and menu items
 */
function ServiceOrderItemRow({
  service,
  onRemove,
  isInvalid,
}: ServiceOrderItemRowProps) {
  const { data: serviceDetail, isLoading: isLoadingService } = useServiceDetail(
    service.itemId,
    {
      enabled: service.itemType === "ServiceItem",
    }
  );

  const { data: menuDetail, isLoading: isLoadingMenu } = useMenuItemDetail(
    service.itemId,
    {
      enabled: service.itemType === "MenuItem",
    }
  );
  const isLoading = isLoadingService || isLoadingMenu;

  let itemName = service.itemId; // fallback to itemId
  if (service.itemType === "ServiceItem" && serviceDetail) {
    itemName = serviceDetail.name;
  } else if (service.itemType === "MenuItem" && menuDetail) {
    itemName = menuDetail.name;
  }

  if (isLoading) {
    return (
      <TableRow>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-8 w-8" />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className={isInvalid ? "bg-destructive/5" : ""}>
      <TableCell className="font-medium">
        {itemName}
        <sup> x{service.quantity}</sup>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {service.scheduledDate
          ? format(parseISO(service.scheduledDate), "dd/MM/yyyy", {
              locale: vi,
            })
          : "—"}
      </TableCell>
      <TableCell className="max-w-[100px] text-center">
        {service.note ? (
          <Tooltip>
            <TooltipTrigger>
              <NotepadText className="text-muted-foreground w-5 h-5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">{service.note}</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Xóa dịch vụ</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}

/**
 * Table component for displaying service orders
 */
export function ServiceOrderTable({
  services,
  onRemove,
  invalidServiceIds = [],
}: ServiceOrderTableProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên dịch vụ</TableHead>
            <TableHead className="w-[120px]">Ngày thực hiện</TableHead>
            <TableHead className="w-[200px]">Ghi chú</TableHead>
            <TableHead className="text-right w-[80px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <ServiceOrderItemRow
              key={service.itemId}
              service={service}
              onRemove={() => onRemove(service.itemId)}
              isInvalid={invalidServiceIds.includes(service.itemId)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
