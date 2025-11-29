import { Package, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
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
import StockItemsDataTable from "./items-list";

import type { StockItemDetailsDto } from "~/services/api/stocks/items/dto";
import { useState } from "react";
import CreateItemDialog from "./create-item.dialog";

interface ItemsListViewProps {
  items: StockItemsListDto;
  isLoading: boolean;
}

export default function ItemsListView({
  items,
  isLoading,
}: ItemsListViewProps) {
  return (
    <div>
      {isLoading ? (
        <LoadingSkeleton />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <StockItemsDataTable items={items} />
      )}
    </div>
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
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <Package />
        </EmptyMedia>
        <EmptyTitle>Không tìm thấy hàng hóa</EmptyTitle>
        <EmptyDescription>
          Thử thay đổi bộ lọc hoặc tạo hàng hóa mới
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => setOpenCreateDialog(true)}>
          Tạo hàng hóa mới
        </Button>
      </EmptyContent>
      <CreateItemDialog
        onOpenChange={setOpenCreateDialog}
        open={openCreateDialog}
      />
    </Empty>
  );
}
