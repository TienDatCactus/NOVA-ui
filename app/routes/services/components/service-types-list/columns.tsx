import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { cn } from "~/lib/utils";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ServiceTypeActionsCell from "../../fragments/service-types/actions.cell";
import Image from "~/components/ui/image";

export const columns: ColumnDef<ServiceTypeItem>[] = [
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
      <DataTableColumnHeader column={column} title="Tên loại dịch vụ" />
    ),
    cell: ({ row }) => {
      const type = row.original;
      return (
        <div className="flex items-center gap-3">
          <Image
            src={type.images?.[0].url || ""}
            className="w-6 h-6 object-contain"
            width={48}
            height={48}
            alt={type.name}
          />

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{type.name}</span>
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
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
        <div className="flex justify-end">
          <Badge variant={isActive ? "success" : "warning"}>
            {isActive ? "Hoạt động" : "Ngưng hoạt động"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "serviceCount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Số lượng dịch vụ"
        className="text-center"
      />
    ),
    cell: ({ row }) => {
      const count = row.original.serviceItemCount || 0;
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
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
