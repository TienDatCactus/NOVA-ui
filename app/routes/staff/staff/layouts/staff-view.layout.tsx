import type { ReactNode } from "react";
import type { StaffFilters } from "../container/staff/filter.hooks";

interface StaffViewLayoutProps {
  children: ReactNode;
  totalStaffs: number;
  filters: StaffFilters;
  onFilterChange: <K extends keyof StaffFilters>(
    key: K,
    value: StaffFilters[K]
  ) => void;
  onResetFilters: () => void;
}

export default function StaffViewLayout({
  children,
  totalStaffs,
  filters,
  onFilterChange,
  onResetFilters,
}: StaffViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Quản lý nhân sự</h1>
            <p className="text-muted-foreground">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalStaffs}
              </span>{" "}
              nhân sự
            </p>
          </div>
          <div className="flex items-center gap-2 "></div>
        </div>
        <main className="flex-1 ">{children}</main>
      </div>
    </div>
  );
}
