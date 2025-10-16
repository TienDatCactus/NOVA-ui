import RoomWeekScheduler from "~/features/scheduler";
import type { Route } from "./+types/timeline";
import BookingViewLayout from "./layouts/booking-view.layout";

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
  return (
    <BookingViewLayout>
      <RoomWeekScheduler />
    </BookingViewLayout>
  );
}
