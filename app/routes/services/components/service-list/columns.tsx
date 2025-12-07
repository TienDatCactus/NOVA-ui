import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { cn, formatMoney } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";
import ServiceActionsCell from "../../fragments/services/actions.cell";
import { Button } from "~/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Can } from "~/lib/auth/bouncer";
import { RouteModule } from "~/lib/auth/roles";
import { useAuth } from "~/lib/auth/components";

export const columns: ColumnDef<ServiceItem>[] = [
  {
    accessorKey: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên dịch vụ" />
    ),
    cell: ({ row }) => {
      const service = row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{service.name}</span>
              {!service.active && (
                <Badge variant="secondary" className="text-xs">
                  Ngưng hoạt động
                </Badge>
              )}
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá cơ bản" />
    ),
    cell: ({ row }) => {
      const price = row.original.basePrice;
      return <p className="font-semibold">{formatMoney(price).vndFormatted}</p>;
    },
  },
  {
    accessorKey: "unitName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đơn vị" />
    ),
    cell: ({ row }) => {
      const unitName = row.original.unitName || "—";
      return <span className="text-sm text-muted-foreground">{unitName}</span>;
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Trạng thái"
        className="text-end"
      />
    ),
    cell: ({ row }) => {
      const isActive = row.original.active;
      return (
        <div className="flex ">
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
      const { can } = useAuth();
      if (can.update(RouteModule.Services))
        return <ServiceActionsCell service={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
