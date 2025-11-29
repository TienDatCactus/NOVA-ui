import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { FolderCode } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { BookingListResponseDto } from "~/services/api/booking/dto";
import { Link } from "react-router";
import { DASHBOARD } from "~/lib/fe-url";
import { BookingCard } from "./booking-card";

interface BookingGridProps {
  bookings: BookingListResponseDto;
  isLoading?: boolean;
  refetch?: () => void;
}

export function BookingGridView({
  bookings,
  isLoading,
  refetch,
}: BookingGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCode />
          </EmptyMedia>
          <EmptyTitle>Chưa có đặt phòng</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có đặt phòng nào. Hãy bắt đầu bằng cách tạo đơn đặt phòng
            đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link to={DASHBOARD.bookings.newBooking}>Tạo đơn đặt phòng</Link>
            </Button>
            <Button variant="outline" onClick={refetch}>
              Tải lại
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.bookingCode}
          booking={booking}
          refetch={refetch}
        />
      ))}
    </div>
  );
}
