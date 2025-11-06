import type { Route } from "./+types/invoices";
import BookingFlow from "~/features/create-booking-wizard";

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
  return <div></div>;
}
