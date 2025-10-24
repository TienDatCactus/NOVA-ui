import type { Route } from "./+types/grid";

import BookingGrid from "./components/booking.grid";
import useBookingRoomsWeek from "./container/useBookingRoomsWeek";

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
  const { data, isPending, refetch } = useBookingRoomsWeek();
  return (
    <>
      <BookingGrid bookings={data} isLoading={isPending} refetch={refetch} />
    </>
  );
}
