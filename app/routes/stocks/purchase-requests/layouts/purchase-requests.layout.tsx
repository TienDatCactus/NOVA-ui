import React from "react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import type { PurchaseRequestFilters } from "../container/filter.hooks";
import { PURCHASE_REQUESTS_STATUS } from "~/services/api/stocks/purchase-requests/purchase-requests.types";

interface PurchaseRequestsLayoutProps {
  children: React.ReactNode;
  filters: PurchaseRequestFilters;
  updateFilter: (key: keyof PurchaseRequestFilters, value: any) => void;
  resetFilters: () => void;
  totalItems: number;
}

const PurchaseRequestsLayout = ({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalItems,
}: PurchaseRequestsLayoutProps) => {
  return (
    <div className="grid gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">Yêu cầu mua hàng</h1>
          <p className="text-muted-foreground mt-1">
            Tổng{" "}
            <span className="font-semibold text-foreground">{totalItems}</span>{" "}
            phiếu
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm font-medium">
                Trạng thái:
              </Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  updateFilter("status", value === "all" ? null : value)
                }
              >
                <SelectTrigger id="status-filter" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {PURCHASE_REQUESTS_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <main className="flex-1 space-y-4">{children}</main>
    </div>
  );
};

export default PurchaseRequestsLayout;
