// Query params for GET attendance list
export type StaffAttendanceListParams = {
  staffId?: string;
  from?: string; // "yyyy-MM-dd"
  to?: string; // "yyyy-MM-dd"
  status?: "present" | "absent" | "assigned";
};

// Status enum for attendance
export enum AttendanceStatus {
  Present = "present",
  Absent = "absent",
  Assigned = "assigned",
}

// Status mapping
export const ATTENDANCE_STATUS = [
  { value: "present", label: "Đã chấm công", variant: "default" as const },
  { value: "absent", label: "Vắng mặt", variant: "destructive" as const },
  { value: "assigned", label: "Chưa chấm công", variant: "secondary" as const },
];
