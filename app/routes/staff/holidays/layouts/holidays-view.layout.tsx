import type { ReactNode } from "react";

interface HolidaysViewLayoutProps {
  totalHolidays: number;
  children: ReactNode;
}

export default function HolidaysViewLayout({
  totalHolidays,
  children,
}: HolidaysViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4">
      <main className="flex-1 space-y-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="grid gap-2">
              <h1 className="text-3xl font-bold">Quản lý ngày nghỉ</h1>
              <p className="text-muted-foreground mt-1">
                Tổng{" "}
                <span className="font-semibold text-foreground">
                  {totalHolidays}
                </span>{" "}
                ngày nghỉ
              </p>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
