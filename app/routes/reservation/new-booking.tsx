import BookingFlow from "~/features/create-booking-wizard";
import type { Route } from "./+types/new-booking";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Bookings, Permission.Create);

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return <BookingFlow />;
}
