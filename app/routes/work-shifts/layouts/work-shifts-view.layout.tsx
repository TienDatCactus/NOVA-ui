import type { ReactNode } from "react";

interface WorkShiftsViewLayoutProps {
  totalWorkShifts: number;
  children: ReactNode;
}

export default function WorkShiftsViewLayout({
  children,
  totalWorkShifts,
}: WorkShiftsViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4">
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Quản lý ca làm việc</h1>
            <p className="text-sm text-muted-foreground">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalWorkShifts}
              </span>{" "}
              ca
            </p>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
