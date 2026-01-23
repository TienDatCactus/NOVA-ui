import {
  Ban,
  Briefcase,
  Calculator,
  CalendarDays,
  Clock,
  Download,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatMoney } from "~/lib/utils";
import { useExportPayslips, usePayrollDetail } from "../container/query.hooks";
import ComponentsList from "./payroll-detail-dialog/components-list";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { hasRole } from "~/lib/auth/bouncer";
import { UserRole } from "~/lib/auth/roles";

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
  const {
    data: payroll,
    isPending,
    refetch,
  } = usePayrollDetail(payrollId, {
    enabled: open,
  });
  const { mutateAsync, isPending: isExporting } = useExportPayslips(payrollId);
  const handleExportPayslip = async () => {
    const blob = await mutateAsync();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PhieuLuong_${payroll?.staffCode}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Xuất phiếu lương thành công");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] overflow-hidden p-0 flex flex-col gap-0 bg-background">
        {/* Header */}
        <DialogHeader className="px-6 py-4 shrink-0 border-b bg-muted/5">
          <DialogTitle>Chi tiết phiếu lương</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : payroll ? (
          <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
            {/* Tabs List */}
            <div className="p-2 border-b bg-background px-6">
              <TabsList className="h-10 p-0 bg-transparent gap-6">
                <TabsTrigger value="info">Thông tin chung</TabsTrigger>
                <TabsTrigger value="components">Phụ cấp & Khấu trừ</TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content Wrapper */}
            <div className="flex-1 overflow-hidden bg-muted/5">
              {/* INFO TAB */}
              <TabsContent
                value="info"
                className="h-full m-0 data-[state=inactive]:hidden"
              >
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* 1. Employee Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" /> Thông tin nhân viên
                        </h3>
                        <div className="bg-background rounded-lg border p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Họ và tên
                            </span>
                            <span className="font-semibold">
                              {payroll.staffName}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Mã nhân viên
                            </span>
                            <span className="font-mono">
                              {payroll.staffCode}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Trạng thái
                            </span>
                            <div className="flex gap-2">
                              <Badge
                                variant={
                                  payroll.locked ? "default" : "secondary"
                                }
                                className="h-5 text-[10px]"
                              >
                                {payroll.locked ? "Đã khóa" : "Tạm tính"}
                              </Badge>
                              {payroll.hasExpense && (
                                <Badge className="h-5 text-[10px] bg-green-600 hover:bg-green-700">
                                  Đã chi
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" /> Thông tin công
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <InfoCard
                            label="Ngày công chuẩn"
                            value={payroll.daysInMonth}
                            icon={CalendarDays}
                          />
                          <InfoCard
                            label="Ngày làm việc"
                            value={payroll.workDays?.toFixed(2)}
                            icon={Clock}
                            highlight
                          />
                          <InfoCard
                            label="Nghỉ không lương"
                            value={payroll.unpaidLeaveDays}
                            icon={Ban}
                            valueColor="text-orange-600"
                          />
                          <InfoCard
                            label="Phép còn lại"
                            value={payroll.paidLeaveDaysRemaining?.toFixed(2)}
                            icon={CalendarDays}
                            valueColor="text-blue-600"
                          />
                        </div>
                      </section>
                    </div>

                    <Separator />

                    {/* 2. Salary Breakdown */}
                    <section className="space-y-3">
                      <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                        <Calculator className="h-3.5 w-3.5" /> Chi tiết lương
                      </h3>

                      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                        {/* Rows */}
                        <div className="divide-y">
                          <SalaryRow
                            label="Lương cơ bản (Tháng)"
                            value={payroll.baseSalaryFullMonth}
                          />
                          <SalaryRow
                            label="Lương thực tế (Theo ngày công)"
                            value={payroll.baseSalaryCalculated}
                            highlight
                          />
                          <SalaryRow
                            label="Tổng phụ cấp / Khấu trừ"
                            value={payroll.componentsTotal}
                            valueColor={
                              (payroll.componentsTotal || 0) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          />
                        </div>

                        {/* Summary Footer */}
                        <div className="bg-muted/10 p-4 border-t space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">
                              Tổng thu nhập
                            </span>
                            <span className="text-lg font-bold font-mono">
                              {
                                formatMoney(payroll.totalAmount || 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Đã tạm ứng / Thanh toán</span>
                            <span className="font-mono">
                              {
                                formatMoney(payroll.paidAmount || 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                          <Separator className="bg-border/50" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-orange-700">
                              Thực lĩnh còn lại
                            </span>
                            <span className="text-xl font-bold font-mono text-orange-600">
                              {
                                formatMoney(payroll.remainingAmount || 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* COMPONENTS TAB */}
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

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-4 border-t bg-background shrink-0 flex justify-between items-center sm:justify-between">
          <p className="text-xs text-muted-foreground italic">
            * Dữ liệu được cập nhật lần cuối lúc{" "}
            {new Date().toLocaleTimeString()}
          </p>
          {payroll && hasRole(AuthLoader.getUser(), UserRole.Accountant) && (
            <Button
              variant="success"
              size="sm"
              onClick={handleExportPayslip}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Xuất phiếu lương
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Helper Components for Clean Code ---

function InfoCard({ label, value, icon: Icon, highlight, valueColor }: any) {
  return (
    <div
      className={`p-3 rounded-lg border ${highlight ? "bg-primary/5 border-primary/20" : "bg-background"}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      <p className={`text-lg font-bold ${valueColor || "text-foreground"}`}>
        {value || 0}
      </p>
    </div>
  );
}

function SalaryRow({ label, value, highlight, valueColor }: any) {
  return (
    <div
      className={`flex justify-between items-center p-3 ${highlight ? "bg-muted/30" : ""}`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono font-medium ${valueColor || ""}`}>
        {formatMoney(value || 0).vndFormatted}
      </span>
    </div>
  );
}
