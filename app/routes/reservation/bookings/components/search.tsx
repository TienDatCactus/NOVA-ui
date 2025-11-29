import { Calendar as CalendarIcon, Download, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Calendar } from "~/components/ui/calendar";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "~/services/api/booking/booking.types";
import { BookingService } from "~/services/api/booking";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DatePicker } from "~/components/ui/date-picker";

export interface BookingSearchFilters {
  searchText: string;
  status: string;
  source: string;
  date?: string;
  onDateChange?: (date: Date | undefined) => void;
}

interface SearchRoomProps {
  filters: BookingSearchFilters;
  onFiltersChange: (filters: BookingSearchFilters) => void;
  onReset: () => void;
  date?: Date | string;
  onDateChange?: (date: Date | undefined) => void;
}

function SearchRoom({
  filters,
  onFiltersChange,
  onReset,
  date,
  onDateChange,
}: SearchRoomProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportDate, setExportDate] = useState<Date>(new Date()); // Mặc định ngày hiện tại
  const [openExportDialog, setOpenExportDialog] = useState(false);

  const handleSearchTextChange = (value: string) => {
    onFiltersChange({ ...filters, searchText: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleSourceChange = (value: string) => {
    onFiltersChange({ ...filters, source: value });
  };

  const handleOpenExportDialog = () => {
    setExportDate(new Date()); // Reset về ngày hiện tại
    setOpenExportDialog(true);
  };

  const handleConfirmExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setOpenExportDialog(false);
      toast.loading("Đang xuất file...", { id: "export-bookings" });

      const dateParam = format(exportDate, "yyyy-MM-dd");
      const blob = await BookingService.exportBookings(dateParam);

      // Ensure blob is valid
      if (!blob || !(blob instanceof Blob)) {
        throw new Error("Dữ liệu không hợp lệ");
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `danh-sach-booking-${format(exportDate, "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("Xuất file thành công", { id: "export-bookings" });
    } catch (error: any) {
      toast.error(error?.message || "Xuất file thất bại. Vui lòng thử lại", {
        id: "export-bookings",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters =
    filters.searchText ||
    (filters.status && filters.status !== "all") ||
    (filters.source && filters.source !== "all");

  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10" />
          <Input
            className="h-9 pl-9 bg-white shadow-sm"
            placeholder="Tìm mã booking, tên khách, SĐT..."
            value={filters.searchText}
            onChange={(e) => handleSearchTextChange(e.target.value)}
          />
        </div>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] h-9 bg-white shadow-sm">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {BOOKING_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.source} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-[180px] h-9  bg-white shadow-sm">
            <SelectValue placeholder="Kênh đặt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả kênh</SelectItem>
            {BOOKING_SOURCES.map((channel) => (
              <SelectItem key={channel.key} value={channel.value + ""}>
                {channel.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePicker
          value={date}
          onChange={onDateChange}
          placeholder="Chọn ngày"
          className="w-[180px] h-9 bg-white shadow-sm"
        />
      </div>

      <Button
        variant="success"
        size="sm"
        onClick={handleOpenExportDialog}
        disabled={isExporting}
        className="h-9 gap-1"
      >
        <Download className="h-4 w-4" />
        Xuất File
      </Button>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-9 gap-1"
        >
          <X className="h-4 w-4" />
          Xóa bộ lọc
        </Button>
      )}

      {/* Export Dialog */}
      <Dialog open={openExportDialog} onOpenChange={setOpenExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xuất danh sách booking</DialogTitle>
            <DialogDescription>
              Chọn ngày để xuất danh sách booking. Mặc định là ngày hiện tại.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={exportDate}
              onSelect={(date) => {
                if (date) setExportDate(date);
              }}
              locale={vi}
              className="rounded-md border"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenExportDialog(false)}
              disabled={isExporting}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              Xuất file ({format(exportDate, "dd/MM/yyyy", { locale: vi })})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SearchRoom;
