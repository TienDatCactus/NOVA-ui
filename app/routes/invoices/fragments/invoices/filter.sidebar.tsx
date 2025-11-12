import { ChevronDown, Search, X, ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { InvoiceFilters } from "../../container/invoices/filter.hooks";
import {
  INVOICE_STATUSES,
  PAYMENT_METHODS,
  INVOICE_ITEM_TYPES,
} from "~/services/api/invoices/invoice.types";
import { DateRangePicker } from "~/components/ui/date-range-picker";

interface InvoicesFilterSidebarProps {
  filters: InvoiceFilters;
  onFilterChange: <K extends keyof InvoiceFilters>(
    key: K,
    value: InvoiceFilters[K]
  ) => void;
  onResetFilters: () => void;
}

function InvoicesFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
}: InvoicesFilterSidebarProps) {
  const activeFiltersCount =
    (filters.searchText ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.paymentMethod ? 1 : 0) +
    (filters.dateRange?.from || filters.dateRange?.to ? 1 : 0) +
    (filters.bookingCode ? 1 : 0) +
    (filters.bookingId ? 1 : 0) +
    (filters.invoiceType ? 1 : 0);

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
                    "sortDirection",
                    filters.sortDirection === "asc" ? "desc" : "asc"
                  )
                }
                className="h-7 gap-1.5 px-2"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="text-xs">
                  {filters.sortDirection === "asc" ? "Tăng dần" : "Giảm dần"}
                </span>
              </Button>
            </div>
            <Input
              id="search"
              placeholder="Mã hóa đơn, mã booking, tên khách..."
              value={filters.searchText}
              onChange={(e) => onFilterChange("searchText", e.target.value)}
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
                value={filters.status || ""}
                onValueChange={(value) => {
                  onFilterChange("status", value || undefined);
                }}
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
              <Label className="text-sm font-medium">Phương thức thanh toán</Label>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <RadioGroup
                value={filters.paymentMethod || ""}
                onValueChange={(value) => {
                  onFilterChange("paymentMethod", value || undefined);
                }}
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
                value={filters.invoiceType || ""}
                onValueChange={(value) => {
                  onFilterChange("invoiceType", value || undefined);
                }}
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
            <Label className="text-sm font-medium">Khoảng thời gian</Label>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => onFilterChange("dateRange", range)}
              placeholder="Chọn khoảng ngày"
            />
          </div>
        </CardContent>

        <Separator />

        <CardContent className="px-0 rounded-md">
          <div className="space-y-3">
            <Label htmlFor="booking-code" className="text-sm font-medium">
              Mã booking
            </Label>
            <Input
              id="booking-code"
              placeholder="BK2025..."
              value={filters.bookingCode || ""}
              onChange={(e) =>
                onFilterChange("bookingCode", e.target.value || undefined)
              }
            />
            <p className="text-xs text-muted-foreground">
              Chọn từ danh sách booking hoặc nhập thủ công
            </p>
          </div>
        </CardContent>

        <Separator />

        <CardContent className="px-0 rounded-md">
          <div className="space-y-3">
            <Label htmlFor="booking-id" className="text-sm font-medium">
              Booking ID
            </Label>
            <Input
              id="booking-id"
              placeholder="UUID của booking"
              value={filters.bookingId || ""}
              onChange={(e) =>
                onFilterChange("bookingId", e.target.value || undefined)
              }
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Chọn từ danh sách booking hoặc nhập UUID
            </p>
          </div>
        </CardContent>

        <Separator />

        <CardContent className="px-0 rounded-md">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sắp xếp theo</Label>
            <Select
              value={filters.sortBy || "IssuedDate"}
              onValueChange={(value) => onFilterChange("sortBy", value)}
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

        <Separator />

        <CardContent className="px-0 rounded-md">
          <div className="space-y-3">
            <Label htmlFor="page-size" className="text-sm font-medium">
              Số bản ghi/trang
            </Label>
            <Select
              value={String(filters.pageSize)}
              onValueChange={(value) => onFilterChange("pageSize", Number(value))}
            >
              <SelectTrigger id="page-size" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

export default InvoicesFilterSidebar;
