import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Lock, Check, X } from "lucide-react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  ROOM_MANAGEMENT_STATUS_LABELS,
  ROOM_MANAGEMENT_STATUS_COLORS,
} from "~/lib/constants";
import { formatMoney } from "~/lib/utils";
import useRoomSchema from "~/services/schema/room.schema";

const { RoomListItemSchema } = useRoomSchema();
type RoomListItem = z.infer<typeof RoomListItemSchema>;

export const columns: ColumnDef<RoomListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={row.getToggleExpandedHandler()}
          className="p-0 h-8 w-8"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ) : null;
    },
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
    accessorKey: "roomName",
    header: "Tên phòng",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{row.original.roomName}</span>
          {row.original.locked && <Lock className="h-3 w-3 text-purple-500" />}
        </div>
      );
    },
  },
  {
    accessorKey: "roomTypeName",
    header: "Loại phòng",
    cell: ({ row }) => {
      return (
        <div className="space-y-1">
          <p className="font-medium">{row.original.roomTypeName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.roomTypeCode}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;
      const label = ROOM_MANAGEMENT_STATUS_LABELS[status];
      const colorClass = ROOM_MANAGEMENT_STATUS_COLORS[status];

      return <Badge className={colorClass}>{label}</Badge>;
    },
  },
  {
    accessorKey: "dailyPrice",
    header: "Giá/đêm",
    cell: ({ row }) => {
      return (
        <span className="font-semibold">
          {formatMoney(row.original.dailyPrice).vndFormatted}
        </span>
      );
    },
  },
  {
    accessorKey: "isOccupied",
    header: "Đang sử dụng",
    cell: ({ row }) => {
      return row.original.isOccupied ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <X className="h-5 w-5 text-gray-400" />
      );
    },
  },
];
