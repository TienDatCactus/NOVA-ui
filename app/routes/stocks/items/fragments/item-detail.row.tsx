import { useState } from "react";
import { History } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";
import { formatMoney } from "~/lib/utils";
import { TransactionHistoryDialog } from "../components/transaction-history.dialog";

interface ItemDetailRowProps {
  item: StockItemsListItemDto;
}

export function ItemDetailRow({ item }: ItemDetailRowProps) {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const currentStock = item.currentStock ?? 0;
  const minStock = item.minStock ?? 0;
  const maxStock = item.maxStock ?? 0;
  const isLowStock = currentStock < minStock && minStock > 0;
  const isHighStock = maxStock > 0 && currentStock > maxStock;

  return (
    <Card className="border-0 shadow-none bg-muted/50">
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase">
            Mô tả:{" "}
          </h4>
          <span className="text">
            {item.description || "— Không có mô tả —"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Thông tin giá */}

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase">
              Thông tin giá
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Giá nhập:</span>
                <span className="font-mono text-sm font-medium">
                  {formatMoney(item.unitCost ?? 0).vndFormatted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Giá bán:</span>
                <span className="font-mono text-sm font-medium">
                  {formatMoney(item.unitPrice ?? 0).vndFormatted}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Giá TB (Moving Avg):
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {formatMoney(item.averageCost ?? 0).vndFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin tồn kho */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase">
              Cấu hình tồn kho
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tồn hiện tại:
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${
                      isLowStock
                        ? "text-destructive"
                        : isHighStock
                          ? "text-orange-600"
                          : "text-green-600"
                    }`}
                  >
                    {currentStock} {item.unitName}
                  </span>
                  {isLowStock && (
                    <Badge variant="destructive" className="text-xs">
                      Thấp
                    </Badge>
                  )}
                  {isHighStock && (
                    <Badge variant="secondary" className="text-xs">
                      Cao
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tồn tối thiểu:
                </span>
                <span className="text-sm">
                  {minStock} {item.unitName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tồn tối đa:
                </span>
                <span className="text-sm">
                  {maxStock} {item.unitName}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase">
              Thông tin khác
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Đơn vị:</span>
                <span className="text-sm font-medium">
                  {item.unitName} - {item.unitCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Danh mục:</span>
                <span className="text-sm">{item.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Trạng thái:
                </span>
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Hoạt động" : "Ngừng"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Mô tả (full width) */}
        {item.description && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase">
                Mô tả
              </h4>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </>
        )}

        {/* Transaction History Button */}
        <Separator className="my-4" />
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTransactionDialogOpen(true)}
          >
            <History className="mr-2 h-4 w-4" />
            Xem lịch sử giao dịch
          </Button>
        </div>
      </CardContent>

      {/* Transaction History Dialog */}
      <TransactionHistoryDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        itemId={item.id}
        itemName={item.name}
      />
    </Card>
  );
}
