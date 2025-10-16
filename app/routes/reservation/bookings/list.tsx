import { useNavigation } from "react-router";
import type { Route } from "./+types/list";
import useBookings from "./container/useBookings";
import BookingViewLayout from "./layouts/booking-view.layout";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { data, error, isPending } = useBookings();
  return (
    <BookingViewLayout>
      {/* Frontend Code here. */}
      <h1>{JSON.stringify(data)}</h1>
    </BookingViewLayout>
  );
}
