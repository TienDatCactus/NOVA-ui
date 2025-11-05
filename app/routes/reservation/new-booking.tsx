import BookingFlow from "~/features/create-booking-dialog/booking-flow";
import type { Route } from "./+types/new-booking";

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
  return <BookingFlow />;
}
