import { type ColumnDef } from "@tanstack/react-table";
import type z from "zod";
import { Button } from "~/components/ui/button";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { Checkbox } from "~/components/ui/checkbox";

import { useState } from "react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { formatMoney } from "~/lib/utils";
import { RoomSchema } from "~/services/api/rooms/room.schema";
import RoomActionsCell from "../../fragments/rooms/actions.cell";
import RoomStatusCell from "../../fragments/rooms/status.cell";
import RoomDetailDialog from "../rooms-detail.dialog";

const { RoomListItemSchema } = RoomSchema;
type RoomListItem = z.infer<typeof RoomListItemSchema>;

export const columns: ColumnDef<RoomListItem>[] = [
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
    accessorKey: "roomName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên phòng" />
    ),
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      return (
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0">
                {row.original.roomName}
              </Button>
            </DialogTrigger>
            <RoomDetailDialog
              open={open}
              onOpenChange={setOpen}
              roomId={row.original.roomId}
            />
          </Dialog>
        </div>
      );
    },
  },
  {
    accessorKey: "roomTypeName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại phòng" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      return <RoomStatusCell room={row.original} />;
    },
  },
  {
    accessorKey: "dailyPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá/đêm" />
    ),
    cell: ({ row }) => {
      return (
        <pre className="font-semibold">
          {formatMoney(row.original.dailyPrice).vndFormatted}
        </pre>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <RoomActionsCell room={row.original} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
