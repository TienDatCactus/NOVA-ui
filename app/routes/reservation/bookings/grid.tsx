import { Input } from "~/components/ui/input";
import type { Route } from "./+types/grid";

import SearchRoom from "./fragments/search";
import BookingViewLayout from "./layouts/booking-view.layout";
import useBookings from "./container/useBookings";
import { BookingGrid } from "./components/booking.grid";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { data, isPending } = useBookings();
  return (
    <BookingViewLayout>
      <BookingGrid bookings={data?.data} isLoading={isPending} />
    </BookingViewLayout>
  );
}
