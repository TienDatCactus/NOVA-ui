import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { StaffShiftService } from "~/services/api/staff/staff-shift";

interface UseScheduleExportProps {
  currentWeekStart: Date;
  weekEnd: Date;
  selectedStaffId: string;
}

export function useScheduleExport({
  currentWeekStart,
  weekEnd,
  selectedStaffId,
}: UseScheduleExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportMatrix = async () => {
    setIsExporting(true);

    try {
      const fromDate = format(currentWeekStart, "yyyy-MM-dd");
      const toDate = format(weekEnd, "yyyy-MM-dd");

      console.log("  → Calling exportWeeklyMatrix (file kiểm mới)");
      const blob = await StaffShiftService.exportWeeklyMatrix({
        from: fromDate,
        to: toDate,
      });

      const filename = `lich-lam-viec-kiem-moi-${fromDate}-${toDate}.xlsx`;
      downloadFile(blob, filename);

      toast.success("Xuất file kiểm mới thành công");
    } catch (error) {
      toast.error("Xuất file thất bại. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportForm2 = async () => {
    setIsExporting(true);

    try {
      const fromDate = format(currentWeekStart, "yyyy-MM-dd");
      const toDate = format(weekEnd, "yyyy-MM-dd");

      console.log("  → Calling exportWeeklyForm2 (file kiểm cũ)");
      const blob = await StaffShiftService.exportWeeklyForm2({
        from: fromDate,
        to: toDate,
      });

      const filename = `lich-lam-viec-kiem-cu-${fromDate}-${toDate}.xlsx`;
      downloadFile(blob, filename);

      toast.success("Xuất file kiểm cũ thành công");
    } catch (error) {
      toast.error("Xuất file thất bại. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExportMatrix,
    handleExportForm2,
  };
}
