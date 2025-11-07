import { ChevronDown, Search, X } from "lucide-react";
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
import type { InvoiceFilters } from "../../container/invoices/filter.hooks";
import { INVOICE_STATUSES } from "~/services/api/invoices/invoice.types";

interface InvoicesFilterSidebarProps {
  filters: InvoiceFilters;
  onFilterChange: <K extends keyof InvoiceFilters>(
    key: K,
    value: InvoiceFilters[K]
  ) => void;
  onResetFilters: () => void;
}

const PAYMENT_METHODS = [
  { value: "Cash", label: "Tiền mặt" },
  { value: "Card", label: "Thẻ" },
  { value: "BankTransfer", label: "Chuyển khoản" },
  { value: "OTACollect", label: "OTA thu hộ" },
  { value: "OTAPrepaid", label: "OTA trả trước" },
  { value: "OnAccount", label: "Ghi nợ" },
  { value: "Unknown", label: "Chưa xác định" },
];

function InvoicesFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
}: InvoicesFilterSidebarProps) {
  const activeFiltersCount =
    (filters.searchText ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.paymentMethod ? 1 : 0) +
    (filters.issuedFrom ? 1 : 0) +
    (filters.issuedTo ? 1 : 0);

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

      <Card className="p-4 shadow-sm">
        <CardContent className="px-0">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Tìm kiếm
            </Label>
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
          <div className="space-y-3">
            <Label className="text-sm font-medium">Khoảng thời gian</Label>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="issued-from" className="text-xs text-muted-foreground">
                  Từ ngày
                </Label>
                <Input
                  id="issued-from"
                  type="date"
                  value={filters.issuedFrom || ""}
                  onChange={(e) => onFilterChange("issuedFrom", e.target.value || undefined)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="issued-to" className="text-xs text-muted-foreground">
                  Đến ngày
                </Label>
                <Input
                  id="issued-to"
                  type="date"
                  value={filters.issuedTo || ""}
                  onChange={(e) => onFilterChange("issuedTo", e.target.value || undefined)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

export default InvoicesFilterSidebar;
