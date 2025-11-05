import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { formatMoney } from "~/lib/utils";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import RoomTypesDetailDialog from "../room-types-detail.dialog";
import { useState } from "react";
import { RoomTypeActionsCell } from "../../fragments/room-types/action.cell";

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
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <Button
            variant="link"
            className="p-0 font-medium"
            onClick={() => setOpen(true)}
          >
            {row.original.code}
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
              className="max-w-5xl"
            >
              <RoomTypesDetailDialog
                roomTypeId={row.original.id}
                open={open}
                onOpenChange={setOpen}
              />
            </DialogContent>
          </Dialog>
        </>
      );
    },
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
          <Badge variant={active ? "success" : "warning"}>
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
    header: "",
    cell: ({ row }) => <RoomTypeActionsCell roomType={row.original} />,
  },
];
