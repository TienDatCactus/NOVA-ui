import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { PayrollFilterState } from "../container/filter.hooks";

interface HeaderLayoutProps {
  onGenerateClick: () => void;
  filterState: PayrollFilterState;
  updateFilter: (updates: Partial<PayrollFilterState>) => void;
}

export default function HeaderLayout({
  onGenerateClick,
  filterState,
  updateFilter,
}: HeaderLayoutProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bảng lương</h1>
        <p className="text-muted-foreground">
          Quản lý bảng lương của nhân viên
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={filterState.month?.toString() || "all"}
            onValueChange={(value) =>
              updateFilter({
                month: value === "all" ? undefined : parseInt(value),
              })
            }
          >
            <SelectTrigger className="w-[130px]">
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

          <Select
            value={filterState.year?.toString() || currentYear.toString()}
            onValueChange={(value) => updateFilter({ year: parseInt(value) })}
          >
            <SelectTrigger className="w-[130px]">
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

        <Button onClick={onGenerateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo bảng lương
        </Button>
      </div>
    </div>
  );
}
