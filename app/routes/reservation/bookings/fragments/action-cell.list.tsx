import { type Row } from "@tanstack/react-table";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import useBookingSchema from "~/services/schema/booking.schema";
const { BookingListItemSchema } = useBookingSchema();
type BookingListItem = z.infer<typeof BookingListItemSchema>;
export const ActionCell: React.FC<{ row: Row<BookingListItem> }> = ({
  row,
}) => {
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
          <DropdownMenuItem>Đổi phòng</DropdownMenuItem>
          <DropdownMenuItem>Sửa đặt phòng</DropdownMenuItem>
          <DropdownMenuItem>Hủy đặt phòng</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
