import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";
import { Checkbox } from "~/components/ui/checkbox";

export const columns: ColumnDef<UnitItemDetailResponseDto>[] = [
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
    accessorKey: "code",
    header: "Mã đơn vị",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold">
          {row.getValue("code")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Tên đơn vị",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("name")}</span>
        <span className="text-xs text-muted-foreground">Đơn vị đo lường</span>
      </div>
    ),
  },
  {
    accessorKey: "active",
    header: () => <div className="text-center">Trạng thái</div>,
    cell: ({ row }) => {
      const isActive = row.getValue("active") as boolean;
      return (
        <div className="flex justify-center">
          <Badge variant={isActive ? "success" : "warning"} className="text-xs">
            {isActive ? "Hoạt động" : "Ngừng hoạt động"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center"></div>,
    cell: ({ row, table }) => {
      const unit = row.original;
      const onEdit = (table.options.meta as any)?.onEdit;
      const onDelete = (table.options.meta as any)?.onDelete;

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit?.(unit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(unit)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
