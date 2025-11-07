import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type z from "zod";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import { BookingStatusEnum } from "~/services/types/booking.types";
import { useUpdateBookingStatus } from "../container/booking-mutation.hooks";
import { cn } from "~/lib/utils";

const { BookingListItemSchema } = BookingSchema;
type BookingListItem = z.infer<typeof BookingListItemSchema>;

interface BookingStatusCellProps {
  booking: BookingListItem;
}

const statusColors = {
  Pending: {
    trigger: "border-orange-600 bg-orange-500/10 text-orange-600",
    focus: "focus-visible:border-orange-600 focus-visible:ring-orange-600/20",
    svg: "[&_svg]:!text-orange-600",
  },
  Confirmed: {
    trigger: "border-blue-600 bg-blue-500/10 text-blue-600",
    focus: "focus-visible:border-blue-600 focus-visible:ring-blue-600/20",
    svg: "[&_svg]:!text-blue-600",
  },
  CheckedIn: {
    trigger: "border-green-600 bg-green-500/10 text-green-600",
    focus: "focus-visible:border-green-600 focus-visible:ring-green-600/20",
    svg: "[&_svg]:!text-green-600",
  },
  InHouse: {
    trigger: "border-emerald-600 bg-emerald-500/10 text-emerald-600",
    focus: "focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20",
    svg: "[&_svg]:!text-emerald-600",
  },
  CheckedOut: {
    trigger: "border-gray-600 bg-gray-500/10 text-gray-600",
    focus: "focus-visible:border-gray-600 focus-visible:ring-gray-600/20",
    svg: "[&_svg]:!text-gray-600",
  },
  Cancelled: {
    trigger: "border-red-600 bg-red-500/10 text-red-600",
    focus: "focus-visible:border-red-600 focus-visible:ring-red-600/20",
    svg: "[&_svg]:!text-red-600",
  },
};

function BookingStatusCell({ booking }: BookingStatusCellProps) {
  const { mutate, isPending } = useUpdateBookingStatus();

  const handleStatusChange = (newStatus: string) => {
    if (!booking.bookingId) return;
    
    mutate({ 
      bookingId: booking.bookingId, 
      newStatus: newStatus 
    });
  };

  const currentStatusColor =
    statusColors[booking.status as keyof typeof statusColors] ||
    statusColors.Pending;

  return (
    <Select
      disabled={isPending}
      value={booking.status}
      onValueChange={handleStatusChange}
    >
      <SelectTrigger
        className={cn(
          "w-full shadow-none",
          currentStatusColor.trigger,
          currentStatusColor.focus,
          currentStatusColor.svg
        )}
      >
        <SelectValue placeholder="Thay đổi trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Trạng thái đặt phòng</SelectLabel>
          {Object.entries(BookingStatusEnum).map(([key, value]) => (
            <SelectItem key={key} value={key}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default BookingStatusCell;
