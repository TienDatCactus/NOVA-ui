import { Search, X } from "lucide-react";
import type z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import useBookingSchema from "~/services/schema/booking.schema";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "~/services/types/booking.types";

export interface BookingSearchFilters {
  searchText: string;
  status: string;
  source: string;
}

interface SearchRoomProps {
  filters: BookingSearchFilters;
  onFiltersChange: (filters: BookingSearchFilters) => void;
  onReset: () => void;
}

function SearchRoom({ filters, onFiltersChange, onReset }: SearchRoomProps) {
  const handleSearchTextChange = (value: string) => {
    onFiltersChange({ ...filters, searchText: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleSourceChange = (value: string) => {
    onFiltersChange({ ...filters, source: value });
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
            className="h-9 pl-9 bg-white shadow-s"
            placeholder="Tìm mã booking, tên khách, SĐT..."
            value={filters.searchText}
            onChange={(e) => handleSearchTextChange(e.target.value)}
          />
        </div>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] h-9 bg-white shadow-s">
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
          <SelectTrigger className="w-[180px] h-9  bg-white shadow-s">
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
      </div>

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
    </div>
  );
}

export default SearchRoom;
