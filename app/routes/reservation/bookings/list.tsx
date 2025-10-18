import { useNavigation } from "react-router";
import type { Route } from "./+types/list";
import useBookings from "./container/useBookings";
import BookingViewLayout from "./layouts/booking-view.layout";
import BookingList from "./components/booking-list";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { data, isPending, refetch } = useBookings();
  console.log(data);
  return (
    <BookingViewLayout>
      <BookingList bookings={data} isLoading={isPending} refetch={refetch} />
    </BookingViewLayout>
  );
}
