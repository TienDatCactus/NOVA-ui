import type { Route } from "./+types/rooms";
import RoomsViewLayout from "./layouts/rooms-view.layout";

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
  return <RoomsViewLayout>dat</RoomsViewLayout>;
}
