import type { Route } from "./+types/invoices";

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
    <div>
      {/* Frontend Code here. */}
      <h1>New Route</h1>
    </div>
  );
}
