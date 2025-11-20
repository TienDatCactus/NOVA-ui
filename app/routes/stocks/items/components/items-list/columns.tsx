import { type ColumnDef } from "@tanstack/react-table";
import type z from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

import { useState } from "react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { formatMoney } from "~/lib/utils";
import { RoomSchema } from "~/services/api/rooms/room.schema";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";

export const columns: ColumnDef<StockItemsListItemDto>[] = [
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
      const [open, setOpen] = useState(false);
      return (
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0"></Button>
            </DialogTrigger>
          </Dialog>
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
          <p className="text-xs text-muted-foreground"></p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      return <div></div>;
    },
  },
  {
    accessorKey: "dailyPrice",
    header: () => <p className="text-end">Giá/đêm</p>,
    cell: ({ row }) => {
      return <pre className="font-semibold text-end"></pre>;
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return <div className="flex justify-end"></div>;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
