import { Package } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { StockItemsListDto } from "~/services/api/stocks/items/dto";
import StockItemsDataTable from "./items-list";

import { useState } from "react";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";
import { hasRole } from "~/lib/auth/bouncer";
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
        {hasRole(AuthLoader.getUser(), UserRole.ServiceStaff) && (
          <Button onClick={() => setOpenCreateDialog(true)}>
            Tạo hàng hóa mới
          </Button>
        )}
      </EmptyContent>
      <CreateItemDialog
        onOpenChange={setOpenCreateDialog}
        open={openCreateDialog}
      />
    </Empty>
  );
}
