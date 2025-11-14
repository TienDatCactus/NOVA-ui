import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StaffService } from "~/services/api/staff";
import AttendanceViewLayout from "./layouts/attendance-view.layout";
import AttendanceCalendarView from "./components/attendance-calendar-view";
import MarkAbsentDialog from "./components/mark-absent-dialog";
import MarkAttendanceDialog from "./components/mark-attendance-dialog";
import { useAttendanceContainer } from "./container/container.hooks";
import { useActiveWorkShiftList } from "./container/query.hooks";

export function clientLoader() {
  return { title: "Chấm công - NOVA" };
}

export default function AttendancePage() {
  const {
    currentWeekStart,
    weekDays,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    attendanceData,
    isPending,
    filterState,
    setStaffFilter,
    setStatusFilter,
    markAbsentDialogOpen,
    setMarkAbsentDialogOpen,
    selectedAttendance,
    handleOpenMarkAbsentDialog,
    handleMarkAbsentSuccess,
    handleMarkPresent,
    markAttendanceDialogOpen,
    setMarkAttendanceDialogOpen,
    selectedAttendanceForMark,
    handleOpenMarkAttendanceDialog,
    handleMarkAttendanceSuccess,
  } = useAttendanceContainer();

  // Fetch staff list for filter
  const { data: staffData } = useQuery({
    queryKey: ["staffs"],
    queryFn: async () => await StaffService.getStaffList(),
  });

  // Fetch active work shifts for ordering
  const { data: workShifts, isPending: isWorkShiftsLoading } =
    useActiveWorkShiftList();

  // Map staff data to filter format
  const staffList = useMemo(() => {
    return (
      staffData?.data?.map((staff) => ({
        staffId: staff.id,
        fullName: staff.fullName,
        staffCode: staff.code,
      })) || []
    );
  }, [staffData]);

  return (
    <>
      <AttendanceViewLayout
        currentWeekStart={currentWeekStart}
        weekDays={weekDays}
        goToPreviousWeek={goToPreviousWeek}
        goToNextWeek={goToNextWeek}
        goToToday={goToToday}
        totalAttendances={attendanceData.length}
        filterState={filterState}
        setStaffFilter={setStaffFilter}
        setStatusFilter={setStatusFilter}
        staffList={staffList}
      >
        {isPending || isWorkShiftsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Đang tải...</div>
          </div>
        ) : (
          <AttendanceCalendarView
            attendanceData={attendanceData}
            weekDays={weekDays}
            workShifts={workShifts || []}
            onMarkAbsent={handleOpenMarkAbsentDialog}
            onMarkPresent={handleMarkPresent}
            onMarkAttendance={handleOpenMarkAttendanceDialog}
          />
        )}
      </AttendanceViewLayout>

      {/* Mark Absent Dialog */}
      <MarkAbsentDialog
        open={markAbsentDialogOpen}
        onOpenChange={setMarkAbsentDialogOpen}
        attendance={selectedAttendance}
        onSuccess={handleMarkAbsentSuccess}
      />

      {/* Mark Attendance Dialog */}
      <MarkAttendanceDialog
        open={markAttendanceDialogOpen}
        onOpenChange={setMarkAttendanceDialogOpen}
        attendance={selectedAttendanceForMark}
        onSuccess={handleMarkAttendanceSuccess}
      />
    </>
  );
}
