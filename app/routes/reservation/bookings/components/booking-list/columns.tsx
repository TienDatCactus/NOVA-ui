import type { BookingListResponseDto } from "~/services/api/booking/dto";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import useBookingSchema from "~/services/schema/booking.schema";
import type z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { CirclePlus, Info, Pen } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatMoney } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useState } from "react";
import ServiceModal from "~/features/service-modal";
import { ActionCell } from "../../fragments/action-cell.list";
const { BookingItemSchema } = useBookingSchema();
type BookingItem = z.infer<typeof BookingItemSchema>;
export const columns: ColumnDef<BookingItem>[] = [
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
  },
  {
    accessorKey: "source",
    header: "Mã kênh bán",
  },
  {
    accessorKey: "roomsInfo",
    header: "Thông tin phòng",
    cell: ({ row }) => {
      const rooms = row.original.rooms ?? [];
      if (!rooms.length) return <span>-</span>;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-2 ">
              <Badge>{rooms[0].roomTypeName}</Badge>
              <Button variant="outline" size="icon">
                <Info />
              </Button>
            </div>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Thông tin phòng</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[400px] overflow-y-auto p-2">
              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  className="rounded-xl border p-3 shadow-sm flex flex-col gap-1"
                >
                  <div className="font-medium">{room.roomName}</div>
                  <div className="text-sm text-muted-foreground">
                    Số lượng: {rooms.length ?? 1}
                  </div>
                  {room.nightlyPrice && (
                    <div className="text-sm text-muted-foreground">
                      Giá/đêm: {room.nightlyPrice.toLocaleString("vi-VN")}₫
                    </div>
                  )}
                  {room.roomTypeName && (
                    <div className="text-sm text-muted-foreground">
                      Loại phòng: {room.roomTypeName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "customerInfo",
    header: "Thông tin khách hàng",
    cell: ({ row }) => {
      const booking = row.original;
      const hasCustomer =
        booking.customerName || booking.customerPhone || booking.customerEmail;

      if (!hasCustomer) return <span>-</span>;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-2">
              {booking.customerName}
              <Button variant="outline" size="icon">
                <Pen />
              </Button>
            </div>
          </DialogTrigger>

          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Thông tin khách hàng</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm p-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tên:</span>
                <span className="font-medium">
                  {booking.customerName || "Không có"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <span className="font-medium">
                  {booking.customerPhone || "Không có"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">
                  {booking.customerEmail || "Không có"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Số lượng:</span>
                <span className="font-medium">
                  {booking.adults} người lớn
                  {booking.children ? `, ${booking.children} trẻ em` : ""}
                </span>
              </div>

              {booking.note && (
                <div className="mt-2 border-t pt-2">
                  <span className="text-muted-foreground block mb-1">
                    Ghi chú:
                  </span>
                  <span>{booking.note}</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
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
    accessorKey: "totalAmount",
    header: "Tổng cộng",
    cell: ({ row }) => {
      return <span>{formatMoney(row.original.totalAmount).vndFormatted}</span>;
    },
  },
  {
    accessorKey: "paidAmount",
    header: "Khách đã trả",
    cell: ({ row }) => {
      return <span>{formatMoney(row.original.paidAmount).vndFormatted}</span>;
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
