import type { ReactNode } from "react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import type { MenuFilters } from "~/services/api/menu/menu.types";
import { useMenuCategories } from "../container/menu-categories/query.hooks";
import { Button } from "~/components/ui/button";
import { CheckCircle2, RotateCcw, UtensilsCrossed } from "lucide-react";
import { Separator } from "~/components/ui/separator";

interface MenuViewLayoutProps {
  children: ReactNode;
  totalMenuItems: number;
  updateFilter: <K extends keyof MenuFilters>(
    key: K,
    value: MenuFilters[K]
  ) => void;
  resetFilters: () => void;
  filters: MenuFilters;
}

export default function MenuViewLayout({
  children,
  totalMenuItems,
  updateFilter,
  resetFilters,
  filters,
}: MenuViewLayoutProps) {
  const { data: menuCategories } = useMenuCategories();

  return (
    <div className="flex gap-6 p-4 ">
      <div className="flex-1  space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý thực đơn
            </h1>
            <p className="text-muted-foreground ">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalMenuItems}
              </span>{" "}
              dịch vụ
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-1">
            <div className="w-full sm:w-auto">
              <Select
                onValueChange={(value) => {
                  updateFilter("categoryCode", value === "ALL" ? "" : value);
                }}
              >
                <SelectTrigger className="h-10 w-full sm:w-[200px] border-dashed shadow-sm bg-background">
                  <div className="flex items-center gap-2 truncate">
                    <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Danh mục" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {menuCategories?.map((category) => (
                      <SelectItem key={category.id} value={category.code}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Label htmlFor="active-filter" className="cursor-pointer ">
                Tất cả món ăn
              </Label>
              <Switch
                id="active-filter"
                checked={filters.activeFilter === "all"}
                onCheckedChange={(checked) =>
                  updateFilter("activeFilter", checked ? "all" : "active")
                }
              />
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="border-dashed"
                onClick={resetFilters}
              >
                <RotateCcw />
              </Button>
            </div>

            {/* 3. Reset Button (Conditional) */}
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
