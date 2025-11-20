import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { Select } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import type { ItemsFilter } from "../container/filter.hooks";
import CreateItemDialog from "../components/create-item.dialog";
interface ItemsLayoutProps {
  children: React.ReactNode;
  filters: ItemsFilter;
  updateFilter: (key: keyof ItemsFilter, value: any) => void;
  resetFilters: () => void;
  totalItems: number;
}

const ItemsLayout = ({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalItems,
}: ItemsLayoutProps) => {
  return (
    <div className="grid gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">Quản lý hàng hóa</h1>
          <p className="text-muted-foreground mt-1">
            Tổng{" "}
            <span className="font-semibold text-foreground">{totalItems}</span>{" "}
            sản phẩm
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Switch
                id="active-filter"
                checked={filters.activeFilter === "active"}
                onCheckedChange={(checked) =>
                  updateFilter("activeFilter", checked ? "active" : "inactive")
                }
              />
              <Label htmlFor="active-filter" className="cursor-pointer">
                Tất cả hàng hóa hoạt động
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="low-stock-filter"
                checked={filters.lowStock}
                onCheckedChange={(checked) => updateFilter("lowStock", checked)}
              />
              <Label htmlFor="low-stock-filter" className="cursor-pointer">
                Chỉ hiển thị hàng có tồn kho thấp
              </Label>
            </div>
          </div>
        </div>
      </div>
      <main className="flex-1 space-y-4">{children}</main>
    </div>
  );
};

export default ItemsLayout;
