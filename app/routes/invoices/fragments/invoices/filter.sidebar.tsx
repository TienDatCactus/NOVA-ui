import {
  ArrowUpDown,
  Check,
  ChevronDown,
  CircleX,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

// Types & Hooks
import {
  INVOICE_STATUSES,
  INVOICE_TYPES,
  type InvoiceListParams,
} from "~/services/api/invoices/invoice.types";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useBookings } from "~/routes/reservation/bookings/container/booking-query.hooks";
import type { InvoiceSchema } from "~/services/api/invoices/invoice.schema";
import type z from "zod";
import type { PaymentSchema } from "~/services/schema/payment.schema";
import type { BookingListResponseDto } from "~/services/api/booking/dto";

type InvoiceStatus = z.infer<typeof InvoiceSchema.InvoiceStatusEnum>;
type PaymentMethod = z.infer<typeof PaymentSchema.PaymentMethodEnum>;
type InvoiceType = z.infer<typeof InvoiceSchema.InvoiceTypeEnum>;
type SortByField = "IssuedDate" | "TotalAmount" | "Status" | "InvoiceCode";
type SortDirection = "asc" | "desc";

interface InvoicesFilterBarProps {
  filters: InvoiceListParams;
  onFilterChange: <K extends keyof InvoiceListParams>(
    key: K,
    value: InvoiceListParams[K]
  ) => void;
  onResetFilters: () => void;
}

export default function InvoicesFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
}: InvoicesFilterBarProps) {
  const activeFiltersCount =
    (filters.Status ? 1 : 0) +
    (filters.PaymentMethod ? 1 : 0) +
    (filters.InvoiceType ? 1 : 0) +
    (filters.BookingCode ? 1 : 0);

  const handleSearch = useDebounceCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange("Keyword", e.target.value || undefined);
    },
    500
  );

  const { data: bookings } = useBookings();

  return (
    <div className="w-full space-y-4 px-2">
      <div className="flex flex-col gap-4 md:flex-row items-center md:justify-between">
        <div>
          <Input
            placeholder="Tìm mã hóa đơn, khách..."
            defaultValue={filters.Keyword ?? ""}
            onChange={handleSearch}
            startAddon={<Search />}
            className="w-full"
          />

          <div className="mt-2 flex flex-wrap gap-2">
            <FilterSelect<InvoiceStatus>
              title="Trạng thái"
              options={INVOICE_STATUSES}
              value={filters.Status || undefined}
              onChange={(val) => onFilterChange("Status", val)}
            />

            {/* 3. Payment Method Filter */}
            <FilterSelect<PaymentMethod>
              title="Thanh toán"
              options={PAYMENT_METHODS}
              value={filters.PaymentMethod || undefined}
              onChange={(val) => onFilterChange("PaymentMethod", val)}
            />

            <FilterSelect<InvoiceType>
              title="Loại mục"
              options={INVOICE_TYPES}
              value={filters.InvoiceType || undefined}
              onChange={(val) => onFilterChange("InvoiceType", val)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BookingFilter
            value={filters.BookingCode}
            onChange={(val) => onFilterChange("BookingCode", val)}
            bookings={bookings ?? []}
          />
          <Select
            value={filters.SortBy ?? "IssuedDate"}
            onValueChange={(value) =>
              onFilterChange("SortBy", value as SortByField)
            }
          >
            <SelectTrigger className="h-9 w-40 text-xs">
              <span className="text-muted-foreground mr-1">Sắp xếp:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="IssuedDate">Ngày xuất</SelectItem>
              <SelectItem value="TotalAmount">Tổng tiền</SelectItem>
              <SelectItem value="Status">Trạng thái</SelectItem>
              <SelectItem value="InvoiceCode">Mã HĐ</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Direction Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() =>
              onFilterChange(
                "SortDirection",
                (filters.SortDirection === "asc"
                  ? "desc"
                  : "asc") as SortDirection
              )
            }
            title={filters.SortDirection === "asc" ? "Tăng dần" : "Giảm dần"}
          >
            <ArrowUpDown
              className={cn(
                "h-4 w-4 transition-transform",
                filters.SortDirection === "desc" && "rotate-180"
              )}
            />
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="destructive-ghost" onClick={onResetFilters}>
              <span className="text-xs hidden lg:inline">Đặt lại</span>
              <CircleX className="h-4 w-4 lg:ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface FilterSelectProps<T extends string> {
  title: string;
  options: ReadonlyArray<{
    readonly code?: number;
    readonly value: T | (string & {});
    readonly label: string;
    readonly variant?: string;
    readonly icon?: any;
    readonly disabled?: boolean;
  }>;
  value?: T;
  onChange: (value: T | undefined) => void;
}

function FilterSelect<T extends string>({
  title,
  options,
  value,
  onChange,
}: FilterSelectProps<T>) {
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 border-dashed",
            value && "border-solid border-primary/50 bg-accent"
          )}
        >
          <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
          {title}
          {value && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal text-xs lg:hidden"
              >
                1
              </Badge>
              <span className="hidden lg:inline text-primary font-medium text-xs truncate max-w-[100px]">
                {selectedLabel}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Tìm ${title}...`} />
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => onChange(undefined)} // Clear filter
                className="justify-between"
              >
                Tất cả
                {!value && <Check className="h-4 w-4 opacity-50" />}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    // Toggle logic: if clicking selected, clear it
                    onChange(
                      value === option.value ? undefined : (option.value as T)
                    );
                  }}
                  className="justify-between"
                >
                  {option.label}
                  {value === option.value && (
                    <Check className="h-4 w-4 opacity-100" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Specialized Booking Combobox
 */
function BookingFilter({
  value,
  onChange,
  bookings,
}: {
  value?: string;
  onChange: (val?: string) => void;
  bookings?: BookingListResponseDto;
}) {
  const selectedBooking = bookings?.find((b) => b.bookingCode === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 border-dashed min-w-[140px] justify-start",
            value && "border-solid border-primary/50 bg-accent"
          )}
        >
          {value ? (
            <span className="truncate font-mono text-xs">
              {selectedBooking?.bookingCode || value}
            </span>
          ) : (
            <span className="text-muted-foreground">Chọn Booking</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm booking..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy booking.</CommandEmpty>
            <CommandGroup>
              {/* Add 'Clear' option */}
              <CommandItem
                onSelect={() => onChange(undefined)}
                className="text-muted-foreground"
              >
                <X className="mr-2 h-3.5 w-3.5" />
                Bỏ chọn
              </CommandItem>
              {bookings?.map((booking) => (
                <CommandItem
                  key={booking.bookingCode}
                  value={`${booking.bookingCode} ${booking.customerName}`} // Ensure search matches both
                  onSelect={() => onChange(booking.bookingCode)}
                >
                  <span className="font-mono mr-2">{booking.bookingCode}</span>
                  <span className="truncate text-muted-foreground">
                    {booking.customerName}
                  </span>
                  {value === booking.bookingCode && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
