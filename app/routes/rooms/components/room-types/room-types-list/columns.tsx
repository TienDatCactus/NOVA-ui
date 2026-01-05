import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { TranslationDisplay } from "~/components/translation-display";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";
import { formatMoney } from "~/lib/utils";
import { RoomTypeActionsCell } from "~/routes/rooms/fragments/room-types/action.cell";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import RoomTypesDetailDialog from "../room-types-detail.dialog";

export const columns: ColumnDef<RoomTypesListItemDto>[] = [
  {
    accessorKey: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    cell: ({ row }) => <div className="w-12">{row.index + 1}</div>,
  },

  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã hạng phòng" />
    ),
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

          <RoomTypesDetailDialog
            roomTypeId={row.original.id}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên hạng phòng" />
    ),
    cell: ({ row }) => (
      <TranslationDisplay
        translations={row.original.translations}
        field="name"
      />
    ),
  },
  {
    accessorKey: "baseRate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá cơ bản" />
    ),
    cell: ({ row }) => {
      const baseRate = row.original.baseRate as number;
      const { vndFormatted } = formatMoney(baseRate);
      return <div className="font-medium">{vndFormatted}</div>;
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng phòng" />
    ),
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.roomsCount} phòng</Badge>;
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const { can } = useAuth();
      if (can.update(RouteModule.RoomTypes))
        return <RoomTypeActionsCell roomType={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
