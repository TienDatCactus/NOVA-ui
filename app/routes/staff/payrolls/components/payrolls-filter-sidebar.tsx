import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { PayrollFilterState } from "../container/filter.hooks";

interface PayrollsFilterSidebarProps {
  filterState: PayrollFilterState;
  updateFilter: (updates: Partial<PayrollFilterState>) => void;
}

export default function PayrollsFilterSidebar({
  filterState,
  updateFilter,
}: PayrollsFilterSidebarProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-3">Bộ lọc</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="filter-month">Tháng</Label>
              <Select
                value={filterState.month?.toString() || "all"}
                onValueChange={(value) =>
                  updateFilter({
                    month: value === "all" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger id="filter-month" className="w-40">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-year">Năm</Label>
              <Select
                value={filterState.year?.toString() || currentYear.toString()}
                onValueChange={(value) =>
                  updateFilter({ year: parseInt(value) })
                }
              >
                <SelectTrigger id="filter-year">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
                    (y) => (
                      <SelectItem key={y} value={y.toString()}>
                        Năm {y}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
