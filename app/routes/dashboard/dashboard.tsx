import SectionLayout from "~/components/layouts/sections";
import type { Route } from "./+types/dashboard";

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
    <SectionLayout>
      <h1>New Route</h1>
    </SectionLayout>
  );
}
