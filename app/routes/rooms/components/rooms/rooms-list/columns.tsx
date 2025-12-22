import { type ColumnDef } from "@tanstack/react-table";
import { QrCode } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { Button } from "~/components/ui/button";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { useAuth } from "~/lib/auth/components";
import { RouteModule, UserRole } from "~/lib/auth/roles";
import { formatMoney } from "~/lib/utils";
import { RoomSchema } from "~/services/api/rooms/room.schema";
import RoomActionsCell from "../../../fragments/rooms/actions.cell";
import RoomStatusCell from "../../../fragments/rooms/status.cell";
import { QrDialog } from "../qr.dialog";
import RoomDetailDialog from "../rooms-detail.dialog";

const { RoomListItemSchema } = RoomSchema;
type RoomListItem = z.infer<typeof RoomListItemSchema>;

export const columns: ColumnDef<RoomListItem>[] = [
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.index + 1}
      </span>
    ),
    size: 50,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "roomName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phòng / QR" />
    ),
    cell: ({ row }) => {
      // Local state for row-specific dialogs
      const [qrOpen, setQrOpen] = useState(false);
      const [detailOpen, setDetailOpen] = useState(false);

      return (
        <div className="flex items-center gap-3">
          {hasAnyRole(AuthLoader.getUser(), [
            UserRole.HotelManager,
            UserRole.Receptionist,
          ]) && (
            <Button
              onClick={() => setQrOpen(true)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Lấy mã QR"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          )}

          {/* Room Name Link */}
          <Button
            variant="link"
            className="p-0 h-auto font-semibold text-foreground hover:no-underline hover:text-primary transition-colors text-base"
            onClick={() => setDetailOpen(true)}
          >
            {row.original.roomName}
          </Button>

          {/* Dialogs */}
          <QrDialog
            open={qrOpen}
            onOpenChange={setQrOpen}
            roomId={row.original.roomId}
            roomName={row.original.roomName}
          />
          <RoomDetailDialog
            open={detailOpen}
            onOpenChange={setDetailOpen}
            roomId={row.original.roomId}
          />
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "roomTypeName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại phòng" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1 max-w-[180px]">
          <span
            className="font-medium text-sm truncate"
            title={row.original.roomTypeName}
          >
            {row.original.roomTypeName}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded w-fit uppercase tracking-wider">
            {row.original.roomTypeCode}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <RoomStatusCell room={row.original} />
      </div>
    ),
    size: 140,
  },
  {
    accessorKey: "dailyPrice",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Giá niêm yết"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-right font-mono font-medium text-foreground">
          {formatMoney(row.original.dailyPrice).vndFormatted}
          <span className="text-[10px] text-muted-foreground ml-1">/đêm</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { can } = useAuth();
      if (can.update(RouteModule.Rooms))
        return (
          <div className="flex justify-center">
            <RoomActionsCell room={row.original} />
          </div>
        );
    },
    size: 50,
    enableSorting: false,
    enableHiding: false,
  },
];
