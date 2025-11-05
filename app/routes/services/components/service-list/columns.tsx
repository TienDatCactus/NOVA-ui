import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { cn, formatMoney } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";
import ServiceActionsCell from "../../fragments/services/actions.cell";
import { Button } from "~/components/ui/button";
import { ChevronDown } from "lucide-react";

export const columns: ColumnDef<ServiceItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn dòng"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "name",
    header: "Tên dịch vụ",
    cell: ({ row }) => {
      const service = row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{service.name}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {service.code}
            </p>
          </div>
          {row.getCanExpand() && (
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => row.toggleExpanded()}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  row.getIsExpanded() && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => {
      const description = row.original.description || "—";
      return (
        <p className="text-sm text-muted-foreground truncate max-w-xs">
          {description}
        </p>
      );
    },
  },
  {
    accessorKey: "basePrice",
    header: () => <p className="text-end">Giá cơ bản</p>,
    cell: ({ row }) => {
      const price = row.original.basePrice;
      return (
        <p className="text-end font-semibold">
          {formatMoney(price).vndFormatted}
        </p>
      );
    },
  },
  {
    accessorKey: "unitName",
    header: "Đơn vị",
    cell: ({ row }) => {
      const unitName = row.original.unitName || "—";
      return <span className="text-sm text-muted-foreground">{unitName}</span>;
    },
  },
  {
    accessorKey: "active",
    header: () => <p className="text-end">Trạng thái</p>,
    cell: ({ row }) => {
      const isActive = row.original.active;
      return (
        <div className="flex justify-end">
          <Badge variant={isActive ? "success" : "warning"}>
            {isActive ? "Hoạt động" : "Ngưng hoạt động"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return <ServiceActionsCell service={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
