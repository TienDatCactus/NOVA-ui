import { Package, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "~/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import type { StockItemsListDto } from "~/services/api/stocks/items/dto";
import type { ItemsFilterState } from "../container/items.filter.hooks";
import StockItemsDataTable from "./items-list";

interface ItemsListViewProps {
  items: StockItemsListDto;
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
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Danh sách hàng hóa</CardTitle>
              <Badge variant="default">{items.length} sản phẩm</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Button>
                <Plus />
                Tạo hàng hóa
              </Button>
              <Select
                value={filters.activeFilter}
                onValueChange={(value: any) =>
                  updateFilter("activeFilter", value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  id="low-stock-filter"
                  checked={filters.lowStockOnly}
                  onCheckedChange={(checked) =>
                    updateFilter("lowStockOnly", checked)
                  }
                />
                <Label htmlFor="low-stock-filter" className="cursor-pointer">
                  Chỉ hiển thị tồn kho thấp
                </Label>
              </div>

              {(filters.activeFilter !== "all" || filters.lowStockOnly) && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
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
