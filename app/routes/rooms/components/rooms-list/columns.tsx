import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

import { formatMoney } from "~/lib/utils";
import useRoomSchema from "~/services/schema/room.schema";
import RoomActionsCell from "../../fragments/rooms/room-actions.cell";
import RoomStatusCell from "../../fragments/rooms/room-status.cell";

const { RoomListItemSchema } = useRoomSchema();
type RoomListItem = z.infer<typeof RoomListItemSchema>;

export const columns: ColumnDef<RoomListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
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
          {row.original.locked && <Lock className="h-3 w-3 text-red-500" />}
          {row.getCanExpand() && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => row.toggleExpanded()}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "roomTypeName",
    header: "Loại phòng",
    cell: ({ row }) => {
      return (
        <div className="space-y-1 w-40">
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
      return <RoomStatusCell room={row.original} />;
    },
  },
  {
    accessorKey: "dailyPrice",
    header: () => <p className="text-end">Giá/đêm</p>,
    cell: ({ row }) => {
      return (
        <pre className="font-semibold text-end">
          {formatMoney(row.original.dailyPrice).vndFormatted}
        </pre>
      );
    },
  },
  {
    accessorKey: "isOccupied",
    header: () => <p className="text-center">Tình trạng phòng</p>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.isOccupied ? (
            <Badge variant={"success"}>Đang sử dụng</Badge>
          ) : (
            <Badge variant={"info"}>Trống</Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return <RoomActionsCell room={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
