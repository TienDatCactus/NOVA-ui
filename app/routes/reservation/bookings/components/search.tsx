import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BookOpenCheck,
  CheckCircle2,
  Download,
  RotateCcw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

// Giả lập data type nếu chưa import được
import type { BookingSearchFilters } from "../container/booking-filter.hooks";
import { useExportBookings } from "../container/booking-mutation.hooks";
import { AuthLoader, hasRole, UserRole } from "~/lib/auth/auth.loader";

interface SearchRoomProps {
  filters: BookingSearchFilters;
  updateFilters: <K extends keyof BookingSearchFilters>(
    key: K,
    value: BookingSearchFilters[K]
  ) => void;
  resetFilters: () => void;
}

function SearchRoom({ filters, updateFilters, resetFilters }: SearchRoomProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportDate, setExportDate] = useState<Date>(new Date());
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const { mutateAsync } = useExportBookings(format(exportDate, "yyyy-MM-dd"));
  const handleConfirmExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      toast.loading("Đang chuẩn bị file xuất...", { id: "export-bookings" });

      const blob = await mutateAsync();

      if (!blob || !(blob instanceof Blob)) {
        throw new Error("Dữ liệu blob không hợp lệ");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Booking_List_${format(exportDate, "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setOpenExportDialog(false);
      toast.success("Xuất file thành công", { id: "export-bookings" });
    } catch (error) {
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-1 bg-background rounded-lg">
      <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
        <Input
          startAddon={<Search className="h-4 w-4 text-muted-foreground " />}
          className="w-64"
          placeholder="Tìm theo tên, mã booking..."
          value={filters.searchText}
          onChange={(e) => updateFilters("searchText", e.target.value)}
        />

        <DatePicker
          mode="single"
          value={filters.date}
          onChange={(date) => updateFilters("date", date)}
          locale={vi}
          className="w-[140px] h-10 hidden sm:flex"
          placeholder="Chọn ngày"
        />
        <Button onClick={() => updateFilters("date", undefined)}>
          <BookOpenCheck />
          Tất cả booking
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <RotateCcw />
        </Button>

        {hasRole(AuthLoader.getUser(), UserRole.Receptionist) && (
          <Button
            variant="success"
            size="sm"
            onClick={() => setOpenExportDialog(true)}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </Button>
        )}
      </div>

      {/* Export Dialog */}
      <Dialog open={openExportDialog} onOpenChange={setOpenExportDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Xuất danh sách booking
            </DialogTitle>
            <DialogDescription>
              Hệ thống sẽ xuất danh sách booking dựa trên ngày được chọn dưới
              đây.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center bg-muted/20 rounded-lg my-2">
            <Calendar
              mode="single"
              selected={exportDate}
              onSelect={(date) => date && setExportDate(date)}
              locale={vi}
              className="bg-background  w-full rounded-md border shadow-sm"
            />
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <div className="text-xs text-muted-foreground flex items-center">
              *Định dạng file: .xlsx
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenExportDialog(false)}
                disabled={isExporting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmExport}
                disabled={isExporting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isExporting ? "Đang xuất..." : "Tải xuống"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SearchRoom;
