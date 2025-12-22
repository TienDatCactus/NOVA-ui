import { CheckCircle2, PackageOpen } from "lucide-react";
import React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Progress } from "~/components/ui/progress";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { useLowStockItems } from "../../items/container/query.hooks";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

interface LowStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePurchaseRequest?: () => void;
}

const LowStockDialog: React.FC<LowStockDialogProps> = ({
  open,
  onOpenChange,
  onCreatePurchaseRequest,
}) => {
  const { data: items = [] } = useLowStockItems();

  const handleCreatePurchaseRequest = () => {
    onOpenChange(false);
    onCreatePurchaseRequest?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="grid gap-1">
            <DialogTitle>Cảnh báo tồn kho</DialogTitle>
            <DialogDescription>
              Phát hiện{" "}
              <span className="font-medium text-foreground">
                {items.length}
              </span>{" "}
              mặt hàng dưới định mức tối thiểu.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1">
          {items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant={"icon"}>
                  <CheckCircle2 />
                </EmptyMedia>
                <EmptyTitle>Kho hàng ổn định</EmptyTitle>
                <EmptyDescription>
                  Không có mặt hàng nào dưới định mức.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="divide-y divide-border/50">
              {items.map((item) => {
                const isCritical = item.currentStock === 0;
                const stockPercentage = Math.min(
                  ((item.currentStock ?? 0) / (item.minStock ?? 0)) * 100,
                  100
                );

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                  >
                    {/* Left: Info */}
                    <div className="space-y-1 min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold truncate text-foreground">
                          {item.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] h-4 px-1 text-muted-foreground"
                        >
                          {item.code}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.categoryName}</span>
                        <span>•</span>
                        <span>ĐVT: {item.unitName}</span>
                      </div>
                    </div>

                    {/* Right: Metrics */}
                    <div className="w-[120px] flex flex-col items-end gap-1.5">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            "text-sm font-bold font-mono",
                            isCritical ? "text-destructive" : "text-amber-600"
                          )}
                        >
                          {item.currentStock}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {item.minStock}
                        </span>
                      </div>

                      {/* Visual Bar */}
                      <Progress
                        value={stockPercentage}
                        className={cn(
                          "h-1.5 w-full bg-muted",
                          isCritical ? "bg-destructive" : "bg-amber-500"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-4 border-t bg-background">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Đóng
            </Button>
          </DialogClose>
          {items.length > 0 && (
            <Button
              className="w-full sm:w-auto gap-2"
              onClick={handleCreatePurchaseRequest}
            >
              <PackageOpen className="h-4 w-4" />
              Tạo phiếu nhập hàng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LowStockDialog;
