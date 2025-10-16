import { useNavigate } from "react-router";
import type z from "zod";
import { Skeleton } from "~/components/ui/skeleton";
import useBookingSchema from "~/services/schema/booking.schema";
import { BookingCard } from "../fragments/booking-card.grid";
const { BookingItemSchema } = useBookingSchema();
type BookingItem = z.infer<typeof BookingItemSchema>;
interface BookingGridProps {
  bookings?: BookingItem[];
  isLoading?: boolean;
}

export function BookingGrid({
  bookings = [],
  isLoading = false,
}: BookingGridProps) {
  const navigate = useNavigate();

  const handleBookingClick = (booking: BookingItem) => {
    navigate(`/reservation/bookings/${booking.id}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="h-64">
              <Skeleton className="h-full w-full" />
            </div>
          ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-6xl mb-4">🏨</div>
        <h3 className="text-xl font-medium">Không tìm thấy đặt phòng nào</h3>
        <p className="text-muted-foreground mt-1">
          Thử thay đổi điều kiện tìm kiếm hoặc tạo đặt phòng mới
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onClick={handleBookingClick}
        />
      ))}
    </div>
  );
}
