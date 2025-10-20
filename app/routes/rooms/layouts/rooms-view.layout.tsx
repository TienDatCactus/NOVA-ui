import type { ReactNode } from "react";

function RoomsViewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex ">
      <aside></aside>
      <main className="rounded-sm">{children}</main>
    </div>
  );
}

export default RoomsViewLayout;
