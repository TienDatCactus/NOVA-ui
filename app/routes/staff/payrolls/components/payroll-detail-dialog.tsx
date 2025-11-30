import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { StaffPayrollService } from "~/services/api/staff/staff-payroll";
import { usePayrollDetail } from "../container/query.hooks";
import ComponentsList from "./payroll-detail-dialog/components-list";

interface PayrollDetailDialogProps {
  payrollId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PayrollDetailDialog({
  payrollId,
  open,
  onOpenChange,
}: PayrollDetailDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  const { data, isPending, refetch } = usePayrollDetail(payrollId);

  const payroll = (data as any)?.data || data;

  const handleExportPayslip = async () => {
    setIsExporting(true);
    try {
      const blob = await StaffPayrollService.exportPayslip(payrollId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PhieuLuong_${payroll?.staffCode}_${payroll?.month}_${payroll?.year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất phiếu lương thành công");
    } catch (error) {
      toast.error("Không thể xuất phiếu lương");
      console.error("Export payslip error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-9 pt-6 pb-3 shrink-0 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Chi tiết bảng lương</DialogTitle>
            {payroll && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPayslip}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Xuất phiếu lương
              </Button>
            )}
          </div>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : payroll ? (
          <Tabs
            defaultValue="info"
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            {/* TabsList */}
            <div className="px-6 shrink-0 border-b">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="info" className="text-sm">
                  Thông tin
                </TabsTrigger>
                <TabsTrigger value="components" className="text-sm">
                  Phụ cấp / Khấu trừ
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent
                value="info"
                className="h-full m-0 data-[state=inactive]:hidden"
              >
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-4">
                    {/* Thông tin nhân viên */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xs uppercase text-muted-foreground">
                        Thông tin nhân viên
                      </h3>
                      <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3">
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Mã nhân viên
                          </p>
                          <p className="font-mono text-sm">
                            {payroll.staffCode}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Tên nhân viên
                          </p>
                          <p className="text-sm">{payroll.staffName}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Kỳ lương
                          </p>
                          <p className="text-sm">
                            Tháng {payroll.month}/{payroll.year}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Trạng thái
                          </p>
                          <div className="flex gap-2">
                            <Badge
                              variant={payroll.locked ? "default" : "secondary"}
                              className="text-xs h-5"
                            >
                              {payroll.locked ? "Đã khóa" : "Tạm tính"}
                            </Badge>
                            {payroll.hasExpense && (
                              <Badge
                                variant="default"
                                className="text-xs h-5 bg-green-600"
                              >
                                Đã tạo phiếu chi
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Thông tin công */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xs uppercase text-muted-foreground">
                        Thông tin công
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-md border p-2.5 space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Ngày trong tháng
                          </p>
                          <p className="text-lg font-bold">
                            {payroll.daysInMonth}
                          </p>
                        </div>
                        <div className="rounded-md border p-2.5 space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Ngày công
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {payroll.workDays?.toFixed(2) || 0}
                          </p>
                        </div>
                        <div className="rounded-md border p-2.5 space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Phép không lương
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            {payroll.unpaidLeaveDays}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-md border p-2.5 space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Phép có lương (Quota)
                          </p>
                          <p className="text-base font-semibold">
                            {payroll.paidLeaveQuota}
                          </p>
                        </div>
                        <div className="rounded-md border p-2.5 space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Đã sử dụng
                          </p>
                          <p className="text-base font-semibold text-green-600">
                            {payroll.paidLeaveDaysUsed?.toFixed(2) || 0}
                          </p>
                        </div>
                        <div className="rounded-md border p-2.5 space-y-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            Còn lại
                          </p>
                          <p className="text-base font-semibold">
                            {payroll.paidLeaveDaysRemaining?.toFixed(2) || 0}
                          </p>
                        </div>
                      </div>

                      {payroll.paidLeaveDaysCarryOver > 0 && (
                        <div className="rounded-md bg-blue-50 dark:bg-blue-900/10 border border-blue-200 p-2.5">
                          <p className="text-[11px] text-muted-foreground">
                            Phép cộng dồn
                          </p>
                          <p className="text-sm font-semibold text-blue-600">
                            {payroll.paidLeaveDaysCarryOver} ngày
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Chi tiết lương */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xs uppercase text-muted-foreground">
                        Chi tiết lương
                      </h3>
                      <div className="space-y-1">
                        <div className="flex justify-between py-1">
                          <span className="text-xs text-muted-foreground">
                            Lương cơ bản (Tháng đủ)
                          </span>
                          <span className="font-mono text-sm">
                            {payroll.baseSalaryFullMonth?.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-xs text-muted-foreground">
                            Lương cơ bản (Tính thực tế)
                          </span>
                          <span className="font-mono text-sm font-medium">
                            {payroll.baseSalaryCalculated?.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-xs text-muted-foreground">
                            Tổng phụ cấp/khấu trừ
                          </span>
                          <span
                            className={`font-mono text-sm font-medium ${
                              (payroll.componentsTotal || 0) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {(payroll.componentsTotal || 0) >= 0 ? "+" : ""}
                            {(payroll.componentsTotal || 0).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </span>
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="space-y-1">
                        <div className="flex justify-between py-2 bg-primary/5 px-2 rounded-md">
                          <span className="text-sm font-semibold">
                            Tổng lương
                          </span>
                          <span className="font-mono font-bold">
                            {payroll.totalAmount?.toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-xs text-muted-foreground">
                            Đã trả
                          </span>
                          <span className="font-mono text-sm">
                            {payroll.paidAmount?.toLocaleString("vi-VN")} VNĐ
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-xs text-muted-foreground">
                            Còn lại
                          </span>
                          <span className="font-mono text-sm font-medium text-orange-600">
                            {payroll.remainingAmount?.toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="components"
                className="h-full m-0 data-[state=inactive]:hidden"
              >
                <ComponentsList
                  payrollId={payrollId}
                  components={payroll.components || []}
                  componentsTotal={payroll.componentsTotal || 0}
                  hasExpense={payroll.hasExpense}
                  locked={payroll.locked}
                  onRefresh={refetch}
                />
              </TabsContent>
            </div>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
