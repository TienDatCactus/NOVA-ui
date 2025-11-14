import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { StaffShiftService } from "~/services/api/staff-shift";

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

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Format dates for API (yyyy-MM-dd)
      const fromDate = format(currentWeekStart, "yyyy-MM-dd");
      const toDate = format(weekEnd, "yyyy-MM-dd");
      let blob: Blob;
      let filename: string;

      // If staff is selected, export detail; otherwise export matrix
      if (selectedStaffId) {
        console.log("  → Calling exportWeeklyDetail (staff filter)");
        blob = await StaffShiftService.exportWeeklyDetail(selectedStaffId, {
          from: fromDate,
          to: toDate,
        });
        filename = `lich-lam-viec-chi-tiet-${fromDate}-${toDate}.xlsx`;
      } else {
        console.log("  → Calling exportWeeklyMatrix (no staff filter)");
        blob = await StaffShiftService.exportWeeklyMatrix({
          from: fromDate,
          to: toDate,
        });
        filename = `lich-lam-viec-tuan-${fromDate}-${toDate}.xlsx`;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất file thành công");
    } catch (error) {
      toast.error("Xuất file thất bại. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExport,
  };
}
