import { Outlet } from "react-router";
import type { Route } from "./+types/auth.layout";
import AuthHeader from "~/components/layouts/headers/auth-header";

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
    <main className="flex min-h-screen flex-col">
      <AuthHeader />
      <Outlet />
    </main>
  );
}
