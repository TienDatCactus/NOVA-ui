import { useState } from "react";
import { History, CheckCircle2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";
import { formatMoney } from "~/lib/utils";
import { TransactionHistoryDialog } from "../components/transaction-history.dialog";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { UserRole } from "~/lib/auth/roles";

interface ItemDetailRowProps {
  item: StockItemsListItemDto;
}

export function ItemDetailRow({ item }: ItemDetailRowProps) {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const currentStock = item.currentStock ?? 0;
  const minStock = item.minStock ?? 0;
  const maxStock = item.maxStock ?? 0;

  // Logic kiểm tra tồn kho
  const isLowStock = currentStock < minStock && minStock > 0;
  const isHighStock = maxStock > 0 && currentStock > maxStock;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Header: Title & Actions */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-foreground">
            {item.name || "Chi tiết sản phẩm"}
          </h3>
          {/* Status Badge - Solid Style */}
          {item.isActive ? (
            <span className="inline-flex items-center rounded-md bg-green-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
              Ngừng
            </span>
          )}
        </div>

        {hasAnyRole(AuthLoader.getUser(), [UserRole.HotelManager]) && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setTransactionDialogOpen(true)}
          >
            <History className="mr-2 h-3.5 w-3.5" />
            Lịch sử GD
          </Button>
        )}
      </div>

      {/* Main Grid Layout - 3 Columns with Vertical Dividers */}
      <div className="grid grid-cols-1 divide-y divide-border text-sm lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {/* Column 1: Pricing Info */}
        <div className="bg-card p-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Thông tin giá
          </h4>
          <div className="space-y-3">
            <Row
              label="Giá nhập"
              value={formatMoney(item.unitCost ?? 0).vndFormatted}
            />
            <Row
              label="Giá bán"
              value={formatMoney(item.unitPrice ?? 0).vndFormatted}
            />
            <Row
              label="Giá TB (Moving Avg)"
              value={formatMoney(item.averageCost ?? 0).vndFormatted}
              valueClassName="text-primary font-bold"
            />
          </div>
        </div>

        {/* Column 2: Inventory Config */}
        <div className="bg-card p-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Cấu hình tồn kho
          </h4>
          <div className="space-y-3">
            {/* Current Stock with Alert Logic */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tồn hiện tại:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold ${
                    isLowStock
                      ? "text-destructive"
                      : isHighStock
                        ? "text-amber-600 dark:text-amber-500"
                        : "text-green-700 dark:text-green-500"
                  }`}
                >
                  {currentStock} {item.unitName}
                </span>

                {isLowStock && (
                  <Badge
                    variant="destructive"
                    className="h-5 px-1.5 text-[10px]"
                  >
                    Thấp
                  </Badge>
                )}
                {isHighStock && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 h-5 px-1.5 text-[10px] text-white">
                    Cao
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <dt className="text-xs text-muted-foreground">Tối thiểu</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {minStock}
                </dd>
              </div>
              <div className="text-right">
                <dt className="text-xs text-muted-foreground">Tối đa</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {maxStock}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: General Info */}
        <div className="bg-card p-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Thông tin khác
          </h4>
          <div className="space-y-3">
            <Row
              label="Đơn vị tính"
              value={
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium text-foreground">
                    {item.unitName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({item.unitCode})
                  </span>
                </span>
              }
            />
            <Row
              label="Danh mục"
              value={
                <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {item.categoryName}
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* Footer Description */}
      <div className="border-t border-border bg-muted/30 px-6 py-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 min-w-[60px] text-xs font-bold uppercase text-muted-foreground">
            Mô tả:
          </span>
          <p className="text-sm text-muted-foreground italic">
            {item.description || "— Không có mô tả chi tiết cho sản phẩm này —"}
          </p>
        </div>
      </div>

      {/* Transaction History Dialog */}
      <TransactionHistoryDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        itemId={item.id}
        itemName={item.name ?? ""}
      />
    </div>
  );
}

const Row = ({
  label,
  value,
  valueClassName = "text-foreground font-medium",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex items-center justify-between text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className={valueClassName}>{value}</dd>
  </div>
);
