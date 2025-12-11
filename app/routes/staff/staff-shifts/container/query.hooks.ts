import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StaffShiftService } from "~/services/api/staff/staff-shift";
import { StaffAttendanceService } from "~/services/api/staff/staff-attendance";
import type { StaffShiftListParams } from "~/services/api/staff/staff-shift/staff-shift.type";
import type { StaffAttendanceListParams } from "~/services/api/staff/staff-attendance/staff-attendance.type";
import type {
  CreateShiftScheduleRequest,
  UpdateShiftScheduleRequest,
} from "~/services/api/staff/staff-shift/dto";
import type { MarkAbsentRequest } from "~/services/api/staff/staff-attendance/dto";
import { DeleteScope } from "~/services/api/staff/staff-shift/staff-shift.type";
import { AxiosError } from "axios";

export function useStaffShiftList(params?: StaffShiftListParams) {
  return useQuery({
    queryKey: ["staff-shifts", params],
    queryFn: async () => await StaffShiftService.getStaffShiftList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}

export function useStaffShiftById(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["staff-shift-detail", id],
    queryFn: async () => await StaffShiftService.getStaffShiftById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateShiftSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateShiftScheduleRequest) =>
      await StaffShiftService.createShiftSchedule(data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["staff-shifts"],
        refetchType: "active",
      });
      qc.invalidateQueries({
        queryKey: ["staff-attendance"],
        refetchType: "active",
      });
      toast.success("Tạo lịch làm việc thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useUpdateShiftSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateShiftScheduleRequest;
    }) => await StaffShiftService.updateShiftSchedule(id, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["staff-shifts"],
        refetchType: "active",
      });
      qc.invalidateQueries({
        queryKey: ["staff-shift-detail"],
        refetchType: "active",
      });
      qc.invalidateQueries({
        queryKey: ["staff-attendance"],
        refetchType: "active",
      });
      toast.success("Cập nhật lịch làm việc thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useDeleteStaffShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, scope }: { id: string; scope?: DeleteScope }) =>
      await StaffShiftService.deleteStaffShift(id, scope),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["staff-shifts"],
        refetchType: "active",
      });
      qc.invalidateQueries({
        queryKey: ["staff-attendance"],
        refetchType: "active",
      });
      toast.success("Xóa lịch làm việc thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useExportWeeklyMatrix() {
  return useMutation({
    mutationFn: async (params?: { from?: string; to?: string }) =>
      await StaffShiftService.exportWeeklyMatrix(params),
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useExportWeeklyForm2() {
  return useMutation({
    mutationFn: async (params: { from: string; to: string }) =>
      await StaffShiftService.exportWeeklyForm2(params),
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useStaffAttendanceList(params: StaffAttendanceListParams) {
  return useQuery({
    queryKey: ["staff-attendance", params],
    queryFn: async () =>
      await StaffAttendanceService.getStaffAttendanceList(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}

export function useMarkAbsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data: MarkAbsentRequest;
    }) => await StaffAttendanceService.markAbsent(assignmentId, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["staff-attendance"],
        refetchType: "active",
      });
      qc.invalidateQueries({
        queryKey: ["staff-shifts"],
        refetchType: "active",
      });
      toast.success("Đánh dấu vắng mặt thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useMarkPresent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) =>
      await StaffAttendanceService.markPresent(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["staff-attendance"],
        refetchType: "active",
      });
      qc.invalidateQueries({
        queryKey: ["staff-shifts"],
        refetchType: "active",
      });
      toast.success("Đánh dấu có mặt thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}
