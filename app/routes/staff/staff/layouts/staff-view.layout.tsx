import type { ReactNode } from "react";
import StaffFilterSidebar from "../fragments/filter.sidebar";
import type { StaffFilters } from "../container/filter.hooks";
import { Button } from "~/components/ui/button";
import { UserPlus, FileText } from "lucide-react";

interface StaffViewLayoutProps {
  children: ReactNode;
  filters: StaffFilters;
  onFilterChange: <K extends keyof StaffFilters>(
    key: K,
    value: StaffFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalStaffs: number;
  onCreateStaff?: () => void;
}

export default function StaffViewLayout({
  children,
  filters,
  onFilterChange,
  onResetFilters,
  totalStaffs,
  onCreateStaff,
}: StaffViewLayoutProps) {
  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      <div className="w-72 flex-shrink-0">
        <StaffFilterSidebar
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold">Quản lý nhân sự</h1>
            <p className="text-muted-foreground mt-1">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalStaffs}
              </span>{" "}
              nhân sự
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onCreateStaff && (
              <Button onClick={onCreateStaff} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Thêm nhân sự
              </Button>
            )}
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
