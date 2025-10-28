import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { formatMoney } from "~/lib/utils";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { RoomTypeActionsCell } from "../../fragments/room-types/room-types-action.cell";

export const columns: ColumnDef<RoomTypesListItemDto>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Chọn tất cả"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn hàng"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => <div className="w-12">{row.index + 1}</div>,
  },

  {
    accessorKey: "code",
    header: "Mã hạng phòng",
    cell: ({ row }) => (
      <div className="">
        <Button variant="link" className="p-0 font-medium">
          {row.original.code}
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Tên hạng phòng",
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: "baseRate",
    header: "Giá cơ bản",
    cell: ({ row }) => {
      const baseRate = row.original.baseRate as number;
      const { vndFormatted } = formatMoney(baseRate);
      return <div className="font-medium">{vndFormatted}</div>;
    },
  },
  {
    accessorKey: "active",
    header: "Trạng thái",
    cell: ({ row }) => {
      const active = row.original.active;
      return (
        <div className="flex items-center gap-2">
          <Badge variant={active ? "default" : "secondary"}>
            {active ? "Hoạt động" : "Không hoạt động"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "roomsCount",
    header: "Số lượng phòng",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.roomsCount} phòng</Badge>;
    },
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <RoomTypeActionsCell roomType={row.original} />,
  },
];
