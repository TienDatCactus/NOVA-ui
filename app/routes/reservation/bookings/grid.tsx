import { useRooms } from "~/routes/rooms/container/useRoomQuery";
import type { Route } from "./+types/grid";

import BookingGrid from "./components/booking.grid";

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
  const { data, isPending, refetch } = useRooms();
  return (
    <>
      <BookingGrid rooms={data} isLoading={isPending} refetch={refetch} />
    </>
  );
}
