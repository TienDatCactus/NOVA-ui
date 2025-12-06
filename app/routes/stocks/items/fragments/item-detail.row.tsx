import { useState } from "react";
import { History, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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

  // Logic kiểm tra tồn kho
  const isLowStock = currentStock < minStock && minStock > 0;
  const isHighStock = maxStock > 0 && currentStock > maxStock;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-background shadow-sm transition-all hover:shadow-md">
      {/* Header: Title & Actions */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-background px-6 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">
            {item.name || "Chi tiết sản phẩm"}{" "}
            {/* Fallback name if available in DTO */}
          </h3>
          {/* Status Badge - Solid Style */}
          {item.isActive ? (
            <span className="inline-flex items-center rounded-md bg-green-600 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-gray-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
              Ngừng
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => setTransactionDialogOpen(true)}
        >
          <History className="mr-2 h-3.5 w-3.5" />
          Lịch sử GD
        </Button>
      </div>

      {/* Main Grid Layout - 3 Columns with Vertical Dividers */}
      <div className="grid grid-cols-1 divide-y divide-gray-100 text-sm lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {/* Column 1: Pricing Info */}
        <div className="bg-background p-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
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
              valueClassName="text-blue-700 font-bold"
            />
          </div>
        </div>

        {/* Column 2: Inventory Config */}
        <div className="bg-background p-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Cấu hình tồn kho
          </h4>
          <div className="space-y-3">
            {/* Current Stock with Alert Logic */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Tồn hiện tại:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold ${
                    isLowStock
                      ? "text-destructive"
                      : isHighStock
                        ? "text-amber-600"
                        : "text-green-700"
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
                  <Badge className="bg-amber-500 hover:bg-amber-600 h-5 px-1.5 text-[10px]">
                    Cao
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <dt className="text-xs text-gray-400">Tối thiểu</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{minStock}</dd>
              </div>
              <div className="text-right">
                <dt className="text-xs text-gray-400">Tối đa</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{maxStock}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: General Info */}
        <div className="bg-background p-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Thông tin khác
          </h4>
          <div className="space-y-3">
            <Row
              label="Đơn vị tính"
              value={
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium">{item.unitName}</span>
                  <span className="text-xs text-gray-400">
                    ({item.unitCode})
                  </span>
                </span>
              }
            />
            <Row
              label="Danh mục"
              value={
                <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {item.categoryName}
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* Footer Description */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 min-w-[60px] text-xs font-bold uppercase text-gray-500">
            Mô tả:
          </span>
          <p className="text-sm text-gray-600 italic">
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
  valueClassName = "text-gray-900 font-medium",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex items-center justify-between text-sm">
    <dt className="text-gray-500">{label}</dt>
    <dd className={valueClassName}>{value}</dd>
  </div>
);
