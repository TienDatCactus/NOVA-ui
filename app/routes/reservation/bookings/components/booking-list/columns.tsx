import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { vi } from "date-fns/locale";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { ActionCell } from "../../fragments/action-cell.list";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "~/services/api/booking/booking.types";
import BookingDetailDialog from "../booking-detail.sheet";
const { BookingListItemSchema } = BookingSchema;
type BookingListItem = z.infer<typeof BookingListItemSchema>;
export const columns: ColumnDef<BookingListItem>[] = [
  {
    accessorKey: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    cell: ({ row }) => {
      return row.index + 1;
    },
  },
  {
    accessorKey: "bookingCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã đặt phòng" />
    ),
    cell: ({ row }) => {
      return <BookingDetailDialog bookingCode={row.original.bookingCode!} />;
    },
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kênh bán" />
    ),
    cell: ({ row }) => {
      return (
        <span>
          {BOOKING_SOURCES.find((src) => src.key === row.original.source)
            ?.label || "Không xác định"}
          {row.original.otaName ? ` - ${row.original.otaName}` : ""}
        </span>
      );
    },
  },

  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên khách hàng" />
    ),
  },
  {
    accessorKey: "checkinDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày nhận phòng" />
    ),
    cell: ({ row }) => {
      return (
        <span>
          {format(row.original.checkinDate!, "dd/MM/yyyy", {
            locale: vi,
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "checkoutDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày trả phòng" />
    ),
    cell: ({ row }) => {
      return (
        <span>
          {format(row.original.checkoutDate!, "dd/MM/yyyy", {
            locale: vi,
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            BOOKING_STATUSES.find((item) => item.value === row.original.status)
              ?.variant
          }
        >
          {
            BOOKING_STATUSES.find((item) => item.value === row.original.status)
              ?.label
          }
        </Badge>
      );
    },
  },
  {
    accessorKey: "action",
    header: () => null,
    cell: ({ row }) => <ActionCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
