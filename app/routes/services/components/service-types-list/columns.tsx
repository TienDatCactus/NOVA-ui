import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ServiceTypeActionsCell from "../../fragments/service-types/actions.cell";

type EnrichedServiceTypeItem = ServiceTypeItem & { serviceCount?: number };

export const columns: ColumnDef<EnrichedServiceTypeItem>[] = [
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
    header: "Tên loại dịch vụ",
    cell: ({ row }) => {
      const type = row.original;
      return (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden bg-muted border shadow-s"
            )}
          >
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{type.name}</span>
              {!type.active && (
                <Badge variant="secondary" className="text-xs">
                  Ngưng hoạt động
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {type.code}
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
      const description = row.original.description;
      return (
        <p className="text-sm text-muted-foreground truncate max-w-xs">
          {description || "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "serviceCount",
    header: () => <p className="text-center">Số lượng dịch vụ</p>,
    cell: ({ row }) => {
      const count = row.original.serviceCount || 0;
      return (
        <div className="flex justify-center">
          <Badge variant={count > 0 ? "default" : "secondary"}>
            {count} dịch vụ
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return "—";
      return (
        <span className="text-sm">
          {format(new Date(date), "dd/MM/yyyy", { locale: vi })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return <ServiceTypeActionsCell type={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
