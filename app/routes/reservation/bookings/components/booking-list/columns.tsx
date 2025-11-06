import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { ActionCell } from "../../fragments/action-cell.list";
import BookingDetailDialog from "../booking-detail.sheet";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "~/services/api/booking/booking.types";
const { BookingListItemSchema } = BookingSchema;
type BookingListItem = z.infer<typeof BookingListItemSchema>;
export const columns: ColumnDef<BookingListItem>[] = [
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => {
      return row.index + 1;
    },
  },
  {
    accessorKey: "bookingCode",
    header: "Mã đặt phòng",
    cell: ({ row }) => {
      return <BookingDetailDialog bookingCode={row.original.bookingCode!} />;
    },
  },
  {
    accessorKey: "source",
    header: "Kênh bán",
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
    header: "Tên khách hàng",
  },
  {
    accessorKey: "checkinDate",
    header: "Ngày nhận phòng",
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
    header: "Ngày trả phòng",
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
    header: "Trạng thái",
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
  },
];
