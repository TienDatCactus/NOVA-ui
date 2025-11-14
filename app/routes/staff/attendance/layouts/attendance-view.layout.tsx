import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AttendanceFilterSidebar from "../components/attendance-filter-sidebar";
import type { AttendanceFilterState } from "../container/filter.hooks";

interface AttendanceViewLayoutProps {
  currentWeekStart: Date;
  weekDays: Date[];
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  totalAttendances: number;
  filterState: AttendanceFilterState;
  setStaffFilter: (staffIds: string[]) => void;
  setStatusFilter: (status: string[]) => void;
  staffList: {
    staffId: string;
    fullName: string;
    staffCode: string;
  }[];
  children: React.ReactNode;
}

export default function AttendanceViewLayout({
  currentWeekStart,
  weekDays,
  goToPreviousWeek,
  goToNextWeek,
  goToToday,
  totalAttendances,
  filterState,
  setStaffFilter,
  setStatusFilter,
  staffList,
  children,
}: AttendanceViewLayoutProps) {
  // Calculate week end
  const weekEnd = addDays(currentWeekStart, 6);

  return (
    <div className="flex gap-6 p-4 min-h-screen">
      {/* Filter sidebar - left side */}
      <AttendanceFilterSidebar
        selectedStaffIds={filterState.selectedStaffIds}
        onStaffChange={setStaffFilter}
        selectedStatus={filterState.selectedStatus}
        onStatusChange={setStatusFilter}
        staffList={staffList}
      />

      {/* Main content */}
      <main className="flex-1 space-y-4 min-w-0 overflow-x-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Bảng chấm công</h1>
              <Badge variant="secondary" className="text-sm">
                {totalAttendances} ca làm
              </Badge>
            </div>
            <Button>Xuất file</Button>
          </div>

          {/* Week Navigator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium px-4">
                Tuần {format(currentWeekStart, "w", { locale: vi })} -{" "}
                {format(currentWeekStart, "dd/MM", { locale: vi })} đến{" "}
                {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
              </div>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Tuần này
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">Xem theo ca</Button>
            </div>
          </div>
        </div>

        {/* Calendar view */}
        {children}
      </main>
    </div>
  );
}
