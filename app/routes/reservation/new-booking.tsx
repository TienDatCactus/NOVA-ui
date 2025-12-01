import BookingFlow from "~/features/create-booking-wizard";
import type { Route } from "./+types/new-booking";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return <BookingFlow />;
}
