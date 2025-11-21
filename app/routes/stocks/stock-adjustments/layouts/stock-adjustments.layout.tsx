import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import type { StockAdjustmentFilters } from "../container/filter.hooks";

interface StockAdjustmentsLayoutProps {
  children: React.ReactNode;
  filters: StockAdjustmentFilters;
  updateFilter: (key: keyof StockAdjustmentFilters, value: any) => void;
  resetFilters: () => void;
  totalItems: number;
}

export default function StockAdjustmentsLayout({
  children,
  filters,
  updateFilter,
  totalItems,
}: StockAdjustmentsLayoutProps) {
  return (
    <div className="grid gap-6 p-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">Phiếu điều chỉnh kho</h1>
          <p className="text-muted-foreground mt-1">
            Tổng{" "}
            <span className="font-semibold text-foreground">{totalItems}</span>{" "}
            phiếu
          </p>
        </div>

        {/* Filter: Include Applied */}
        <div className="flex items-center gap-2">
          <Switch
            id="include-applied"
            checked={filters.includeApplied}
            onCheckedChange={(checked) =>
              updateFilter("includeApplied", checked)
            }
          />
          <Label htmlFor="include-applied" className="cursor-pointer">
            Hiển thị phiếu đã áp dụng
          </Label>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 space-y-4">{children}</main>
    </div>
  );
}
