import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { FileText, Loader2, Package } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { usePurchaseRequestDetail } from "../container/query.hooks";
import { getStatusBadge } from "./purchase-requests-list/columns";

interface PurchaseRequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequestId: string;
}

export default function PurchaseRequestDetailDialog({
  open,
  onOpenChange,
  purchaseRequestId,
}: PurchaseRequestDetailDialogProps) {
  const { data, isPending } = usePurchaseRequestDetail(purchaseRequestId);

  const purchaseRequest = (data as any)?.data || data;

  const totalCost =
    purchaseRequest?.items?.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitCost,
      0
    ) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh]  p-0 flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Chi tiết phiếu đề nghị mua hàng
          </DialogTitle>
          <DialogDescription className="mt-1">
            {purchaseRequest?.requestNumber}
          </DialogDescription>
          {purchaseRequest && getStatusBadge(purchaseRequest.status)}
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : purchaseRequest ? (
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Thông tin chung */}
              <Card className="p-4 bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Số phiếu</p>
                    <p className="font-mono font-semibold">
                      {purchaseRequest.requestNumber}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Ngày tạo</p>
                    <p className="font-medium">
                      {format(
                        parseISO(purchaseRequest.requestedAt),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </p>
                  </div>
                  {purchaseRequest.approvedByName && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Người phê duyệt
                        </p>
                        <p className="font-medium">
                          {purchaseRequest.approvedByName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Ngày phê duyệt
                        </p>
                        <p className="font-medium">
                          {purchaseRequest.approvedAt
                            ? format(
                                parseISO(purchaseRequest.approvedAt),
                                "dd/MM/yyyy HH:mm",
                                { locale: vi }
                              )
                            : "—"}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground">Trạng thái</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(purchaseRequest.status)}
                      {purchaseRequest.isReceived && (
                        <Badge variant="default">Đã nhận hàng</Badge>
                      )}
                    </div>
                  </div>
                  {purchaseRequest.notes && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground">Ghi chú</p>
                      <p className="text-sm">{purchaseRequest.notes}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Danh sách hàng hóa */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">
                    Danh sách hàng hóa ({purchaseRequest.items.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {purchaseRequest.items.map((item: any, index: number) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary font-semibold shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-base">
                                {item.freeTextItemName}
                              </p>
                              {item.itemCode && (
                                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                  {item.itemCode}
                                </p>
                              )}
                              {item.freeTextItemDescription && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.freeTextItemDescription}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-primary">
                                {(
                                  item.quantity * item.unitCost
                                ).toLocaleString()}{" "}
                                VNĐ
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.quantity.toLocaleString()} ×{" "}
                                {item.unitCost.toLocaleString()} VNĐ
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">
                                Số lượng:
                              </span>
                              <span className="font-semibold">
                                {item.quantity.toLocaleString()}
                              </span>
                              {item.freeTextUnitName && (
                                <span className="text-muted-foreground">
                                  {item.freeTextUnitName}
                                </span>
                              )}
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">
                                Đơn giá:
                              </span>
                              <span className="font-semibold">
                                {item.unitCost.toLocaleString()} VNĐ
                              </span>
                            </div>
                          </div>

                          {item.note && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground">
                                Ghi chú: {item.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Tổng cộng */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">Tổng chi phí:</span>
                  <span className="font-bold text-2xl text-primary">
                    {totalCost.toLocaleString()} VNĐ
                  </span>
                </div>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Không tìm thấy dữ liệu phiếu đề nghị
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
