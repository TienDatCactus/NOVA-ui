import { useState } from "react";
import type { Route } from "./+types/chat";
import { ChatMain } from "./components/chat-main";
import { ChatSidebar } from "./components/chat-sidebar";
import { AuthLoader, Permission, RouteModule } from "~/lib/auth/auth.loader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tin nhắn - NOVA Hotel Management" },
    { name: "description", content: "Tin nhắn hỗ trợ khách hàng" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Chat, Permission.Read);

export default function Component({}: Route.ComponentProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-50px)] w-full overflow-hidden">
      <ChatSidebar
        activeSessionId={activeSessionId}
        onSessionSelect={setActiveSessionId}
      />
      <ChatMain sessionId={activeSessionId} />
    </div>
  );
}
