import { Filter, Package, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "~/components/ui/empty";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";
import type { ItemsFilterState } from "../container/items.filter.hooks";
import StockItemsDataTable from "./items-list";

interface ItemsListViewProps {
  items: StockItemsListItemDto[];
  isLoading: boolean;
  filters: ItemsFilterState;
  updateFilter: <K extends keyof ItemsFilterState>(
    key: K,
    value: ItemsFilterState[K]
  ) => void;
  resetFilters: () => void;
}

export default function ItemsListView({
  items,
  isLoading,
  filters,
  updateFilter,
  resetFilters,
}: ItemsListViewProps) {
  const navigate = useNavigate();

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Danh sách hàng hóa</CardTitle>
            <Badge variant="default">{items.length} sản phẩm</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, mã, mô tả..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Active filter */}
          <Select
            value={filters.activeFilter}
            onValueChange={(value: any) => updateFilter("activeFilter", value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>

          {/* Low stock filter */}
          <Button
            variant={filters.lowStockOnly ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("lowStockOnly", !filters.lowStockOnly)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Tồn kho thấp
          </Button>

          {/* Reset filters */}
          {(filters.searchQuery ||
            filters.categoryId ||
            filters.activeFilter !== "active" ||
            filters.lowStockOnly) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <StockItemsDataTable items={items} />
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Empty className="flex flex-col items-center justify-center py-12 text-center">
      <EmptyMedia variant={"icon"}>
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
      </EmptyMedia>
      <EmptyHeader>Không tìm thấy hàng hóa</EmptyHeader>
      <EmptyDescription className="text-sm text-muted-foreground mt-2">
        Thử thay đổi bộ lọc hoặc tạo hàng hóa mới
      </EmptyDescription>
    </Empty>
  );
}
