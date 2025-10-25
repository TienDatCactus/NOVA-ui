import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import Image from "~/components/ui/image";
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
    accessorKey: "image",
    header: "Hình ảnh",
    cell: ({ row }) => {
      return <Image src="" alt="" height={100} width={140} />;
    },
  },
  {
    accessorKey: "code",
    header: "Mã hạng phòng",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Tên hạng phòng",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "baseRate",
    header: "Giá cơ bản",
    cell: ({ row }) => {
      const baseRate = row.getValue("baseRate") as number;
      const { vndFormatted } = formatMoney(baseRate);
      return <div className="font-medium">{vndFormatted}</div>;
    },
  },
  {
    accessorKey: "active",
    header: "Trạng thái",
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;
      const roomType = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* <Switch
            checked={active}
            onCheckedChange={(checked) =>
              onToggleActive(roomType.id, checked, roomType)
            }
          /> */}
          <Badge variant={active ? "default" : "secondary"}>
            {active ? "Hoạt động" : "Không hoạt động"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "roomsCount",
    header: "Số phòng",
    cell: ({ row }) => {
      const count = row.getValue("roomsCount") as number;
      return (
        <Badge variant="outline" className="font-mono">
          {count}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <RoomTypeActionsCell roomType={row.original} />,
  },
];
