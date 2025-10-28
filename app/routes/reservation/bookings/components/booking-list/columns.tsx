import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import useBookingSchema from "~/services/schema/booking.schema";
import { ActionCell } from "../../fragments/action-cell.list";
import BookingDetailDialog from "../booking-detail.dialog";
const { BookingListItemSchema } = useBookingSchema();
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
      return <BookingDetailDialog bookingCode={row.original.bookingCode} />;
    },
  },
  {
    accessorKey: "source",
    header: "Mã kênh bán",
  },
  {
    accessorKey: "customerName",
    header: "Tên khách hàng",
  },
  {
    accessorKey: "checkinDate",
    header: "Giờ nhận",
    cell: ({ row }) => {
      return (
        <span>
          {format(row.original.checkinDate, "dd MMMM/yyyy", {
            locale: vi,
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "checkoutDate",
    header: "Giờ trả",
    cell: ({ row }) => {
      return (
        <span>
          {format(row.original.checkoutDate, "dd MMMM/yyyy", {
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
      return <Badge variant="default">{row.original.status}</Badge>;
    },
  },
  {
    accessorKey: "action",
    header: () => null,
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
