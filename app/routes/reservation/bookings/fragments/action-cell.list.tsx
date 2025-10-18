import type { BookingListResponseDto } from "~/services/api/booking/dto";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
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
const { BookingItemSchema } = useBookingSchema();
type BookingItem = z.infer<typeof BookingItemSchema>;
export const ActionCell: React.FC<{ row: Row<BookingItem> }> = ({ row }) => {
  const [open, setOpen] = useState(false);

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
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Thêm sản phẩm, dịch vụ
          </DropdownMenuItem>
          <DropdownMenuItem>Đổi phòng</DropdownMenuItem>
          <DropdownMenuItem>Sửa đặt phòng</DropdownMenuItem>
          <DropdownMenuItem>Hủy đặt phòng</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ServiceModal open={open} toggle={() => setOpen(!open)} />
    </div>
  );
};
