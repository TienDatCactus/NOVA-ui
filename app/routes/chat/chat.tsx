import { useState } from "react";
import type { Route } from "./+types/chat";
import { ChatMain } from "./components/chat-main";
import { ChatSidebar } from "./components/chat-sidebar";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
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
