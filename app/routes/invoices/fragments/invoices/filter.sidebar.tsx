import { ArrowUpDown, ChevronDown, Search, X } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  INVOICE_ITEM_TYPES,
  INVOICE_STATUSES,
  type InvoiceListParams,
} from "~/services/api/invoices/invoice.types";
// Removed booking selection dependencies per updated requirements
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useBookings } from "~/routes/reservation/bookings/container/booking-query.hooks";
import { PAYMENT_METHODS } from "~/services/types/payment.types";

interface InvoicesFilterSidebarProps {
  filters: InvoiceListParams;
  onFilterChange: <K extends keyof InvoiceListParams>(
    key: K,
    value: InvoiceListParams[K]
  ) => void;
  onResetFilters: () => void;
}

function InvoicesFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
}: InvoicesFilterSidebarProps) {
  const activeFiltersCount =
    (filters.Keyword ? 1 : 0) +
    (filters.Status ? 1 : 0) +
    (filters.PaymentMethod ? 1 : 0) +
    (filters.IssuedFrom || filters.IssuedTo ? 1 : 0) +
    (filters.InvoiceType ? 1 : 0);

  const handleSearch = useDebounceCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange("Keyword", e.target.value || undefined);
    },
    500
  );
  // Booking filters removed
  const { data: bookings } = useBookings();

  return (
    <aside className="w-72 flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Xóa ({activeFiltersCount})
          </Button>
        )}
      </div>

      <Card className="p-3 shadow-sm">
        <CardContent className="px-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="search" className="text-sm font-medium">
                Tìm kiếm
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onFilterChange(
                    "SortDirection",
                    filters.SortDirection === "asc" ? "desc" : "asc"
                  )
                }
                className="h-7 gap-1.5 px-2"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="text-xs">
                  {filters.SortDirection === "asc" ? "Tăng dần" : "Giảm dần"}
                </span>
              </Button>
            </div>
            <Input
              id="search"
              placeholder="Mã hóa đơn, mã booking, tên khách..."
              defaultValue={filters.Keyword ?? ""}
              onChange={(e) => handleSearch(e)}
              endAddon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardContent>

        <Separator />

        <CardContent className="px-0 rounded-md">
          <Collapsible className="space-y-3">
            <CollapsibleTrigger>
              <Label className="text-sm font-medium">Trạng thái</Label>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <RadioGroup
                value={filters.Status ?? ""}
                onValueChange={(value) =>
                  onFilterChange("Status", (value as any) || undefined)
                }
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="" id="status-all" />
                  <Label
                    htmlFor="status-all"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Tất cả
                  </Label>
                </div>
                {INVOICE_STATUSES.map((status) => (
                  <div key={status.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      id={`status-${status.value}`}
                      value={status.value}
                    />
                    <Label
                      htmlFor={`status-${status.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {status.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>

        <Separator />

        <CardContent className="px-0 rounded-md">
          <Collapsible className="space-y-3">
            <CollapsibleTrigger>
              <Label className="text-sm font-medium">
                Phương thức thanh toán
              </Label>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <RadioGroup
                value={filters.PaymentMethod ?? ""}
                onValueChange={(value) =>
                  onFilterChange("PaymentMethod", (value as any) || undefined)
                }
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="" id="payment-all" />
                  <Label
                    htmlFor="payment-all"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Tất cả
                  </Label>
                </div>
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      id={`payment-${method.value}`}
                      value={method.value}
                    />
                    <Label
                      htmlFor={`payment-${method.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {method.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>

        <Separator />

        <CardContent className="px-0 rounded-md">
          <Collapsible className="space-y-3">
            <CollapsibleTrigger>
              <Label className="text-sm font-medium">Loại mục hóa đơn</Label>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <RadioGroup
                value={filters.InvoiceType ?? ""}
                onValueChange={(value) =>
                  onFilterChange("InvoiceType", (value as any) || undefined)
                }
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="" id="invoice-type-all" />
                  <Label
                    htmlFor="invoice-type-all"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Tất cả
                  </Label>
                </div>
                {INVOICE_ITEM_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      id={`invoice-type-${type.value}`}
                      value={type.value}
                    />
                    <Label
                      htmlFor={`invoice-type-${type.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>

        <Separator />
        <CardContent className="px-0 rounded-md">
          <div className="space-y-3">
            <Label htmlFor="booking-code" className="text-sm font-medium">
              Theo Booking
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.BookingCode
                    ? bookings?.find(
                        (b) => b.bookingCode === filters.BookingCode
                      )?.bookingCode
                    : "Chọn booking"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Tìm kiếm..." />
                  <CommandList>
                    <CommandEmpty>Không có kết quả nào.</CommandEmpty>
                    <CommandGroup heading="Booking">
                      {bookings?.map((booking) => (
                        <CommandItem
                          key={booking.bookingCode}
                          onSelect={() =>
                            onFilterChange("BookingCode", booking.bookingCode)
                          }
                        >
                          {booking.bookingCode} - {booking.customerName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <Separator />

        {/* Booking filter removed */}

        <CardContent className="px-0 rounded-md">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sắp xếp theo</Label>
            <Select
              value={filters.SortBy ?? "IssuedDate"}
              onValueChange={(value) => onFilterChange("SortBy", value as any)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IssuedDate">Ngày xuất</SelectItem>
                <SelectItem value="TotalAmount">Tổng tiền</SelectItem>
                <SelectItem value="Status">Trạng thái</SelectItem>
                <SelectItem value="InvoiceCode">Mã hóa đơn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

export default InvoicesFilterSidebar;
