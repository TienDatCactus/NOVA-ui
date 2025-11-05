import type { Route } from "./+types/chat";
import { ChatMain } from "./components/chat/main";
import { ChatSidebar } from "./components/chat/sidebar";

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
    <div className="flex h-screen">
      <ChatSidebar />
      <ChatMain />
    </div>
  );
}
