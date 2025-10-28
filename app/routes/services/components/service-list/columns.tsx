import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { cn, formatMoney } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";
import ServiceActionsCell from "../../fragments/services/service-actions.cell";

// Color mapping for service types
const getServiceTypeColor = (typeCode: string) => {
  const colors: Record<string, string> = {
    SPA: "bg-purple-500",
    FOOD: "bg-orange-500",
    DRINK: "bg-blue-500",
    default: "bg-primary",
  };
  return colors[typeCode] || colors.default;
};

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
      const typeCode = (service as any).serviceTypeCode || "";

      return (
        <div className="flex items-center gap-3">
          {/* Color-coded type indicator */}
          <div
            className={cn(
              "w-1 h-10 rounded-full flex-shrink-0",
              getServiceTypeColor(typeCode)
            )}
          />

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

          {/* Expand button */}
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
    accessorKey: "serviceTypeName",
    header: "Loại dịch vụ",
    cell: ({ row }) => {
      const typeName = (row.original as any).serviceTypeName || "—";
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{typeName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <p className="text-sm text-muted-foreground truncate max-w-xs">
          {description || "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "basePrice",
    header: () => <p className="text-end">Đơn giá</p>,
    cell: ({ row }) => {
      return (
        <div className="text-end space-y-1">
          <p className="font-semibold">
            {formatMoney(row.original.basePrice).vndFormatted}
          </p>
          <p className="text-xs text-muted-foreground">
            /{row.original.unitName}
          </p>
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
