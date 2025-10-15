import { Input } from "~/components/ui/input";
import type { Route } from "./+types/grid";

import SearchRoom from "./components/search";

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
    <main className="mb-4 flex w-full flex-col gap-4">
      <div className="bg-white py-2 px-4 shadow-sm rounded-md">
        <h1 className="text-xl font-medium">Room Status Overview</h1>
        <ul></ul>
        <div className="max-w-1/2 mx-auto">
          <SearchRoom />
        </div>
      </div>
    </main>
  );
}
