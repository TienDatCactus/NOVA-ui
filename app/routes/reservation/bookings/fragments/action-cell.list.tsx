import { type Row } from "@tanstack/react-table";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { BookingSchema } from "~/services/schema/booking.schema";

import { useBookingDetail } from "../container/booking-query.hooks";
import UpdateBookingDialog from "../components/update-booking.dialog";
import CancelBookingAlertDialog from "../components/cancel-booking.alert-dialog";
import ChangeRoomDialog from "../components/change-room.dialog";
const { BookingListItemSchema } = BookingSchema;
type BookingListItem = z.infer<typeof BookingListItemSchema>;
export const ActionCell: React.FC<{ row: Row<BookingListItem> }> = ({
  row,
}) => {
  const { data: bookingDetail } = useBookingDetail({
    bookingCode: row.original.bookingCode,
  });
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [changeRoomDialogOpen, setChangeRoomDialogOpen] = useState(false);
  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <CirclePlus />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Tiện ích</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Thêm sản phẩm, dịch vụ</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setChangeRoomDialogOpen(true)}>
            Đổi phòng
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUpdateDialogOpen(true)}>
            Sửa đặt phòng
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Button
            variant={"destructive"}
            className="w-full"
            onClick={() => setCancelDialogOpen(true)}
          >
            Hủy đặt phòng
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
      {bookingDetail && (
        <UpdateBookingDialog
          bookingDetail={bookingDetail}
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
        />
      )}
      <CancelBookingAlertDialog
        bookingDetail={bookingDetail}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
      />
      <ChangeRoomDialog
        open={changeRoomDialogOpen}
        onOpenChange={setChangeRoomDialogOpen}
        bookingDetail={bookingDetail}
      />
    </div>
  );
};
