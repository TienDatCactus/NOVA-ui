import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Download,
  Loader2,
  Search,
  Check,
  X,
  Filter,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { useExportAuditLogs } from "../container/query.hooks";
import { cn, onError } from "~/lib/utils";
import { AuditSchema } from "~/services/api/audit/audit.schema";
import type { ExportAuditRequest } from "~/services/api/audit/dto";
import { DatePicker } from "~/components/ui/date-picker";

interface ExportAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODULE_OPTIONS = [
  { value: "UserManagement", label: "Quản lý người dùng" },
  { value: "Booking", label: "Đặt phòng" },
  { value: "Room", label: "Phòng" },
  { value: "FnB", label: "F&B" },
  { value: "Service", label: "Dịch vụ" },
  { value: "Financial", label: "Tài chính" },
  { value: "SystemConfig", label: "Cấu hình" },
  { value: "Common", label: "Chung" },
];

const ACTION_OPTIONS = [
  { value: "Create", label: "Tạo mới" },
  { value: "Update", label: "Cập nhật" },
  { value: "Delete", label: "Xóa" },
  { value: "Login", label: "Đăng nhập" },
];

export default function ExportAuditDialog({
  open,
  onOpenChange,
}: ExportAuditDialogProps) {
  const exportMutation = useExportAuditLogs();

  const form = useForm<ExportAuditRequest>({
    resolver: zodResolver(AuditSchema.ExportAuditRequestSchema),
    defaultValues: {
      fromDate: undefined,
      toDate: undefined,
      module: undefined,
      action: undefined,
      keyword: undefined,
      success: undefined,
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  const onSubmit = async (data: ExportAuditRequest) => {
    try {
      const blob = await exportMutation.mutateAsync(data);
      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${format(new Date(), "yyyyMMdd-HHmm")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất dữ liệu thành công");
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất dữ liệu");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border-none shadow-xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="flex flex-col"
          >
            {/* HEADER: Clean & Title only */}
            <DialogHeader className="px-6 py-5 border-b border-border/40 bg-background/50 backdrop-blur-sm">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <Download className="w-5 h-5 text-muted-foreground" />
                Xuất nhật ký hệ thống
              </DialogTitle>
            </DialogHeader>

            {/* BODY: Compact Grid */}
            <div className="p-6 space-y-6">
              {/* 1. TIMELINE */}
              <div className="space-y-2">
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Thời gian
                </FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fromDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DatePicker
                            {...field}
                            mode="single"
                            selected={new Date(field.value ?? "")}
                            value={field.value || new Date()}
                            className="h-9"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DatePicker
                            {...field}
                            mode="single"
                            selected={new Date(field.value ?? "")}
                            value={field.value || new Date()}
                            className="h-9"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 2. SCOPE FILTERS */}
              <div className="space-y-2">
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Phạm vi dữ liệu
                </FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="module"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Tất cả Module" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {MODULE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Tất cả Hành động" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {ACTION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 3. SEARCH & STATUS (Combined Row for space efficiency) */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8 space-y-2">
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Từ khóa & User
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="keyword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground opacity-50" />
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="Tìm theo nội dung, user..."
                              className="h-9 pl-9 text-sm"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-4 space-y-2">
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Trạng thái
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="success"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex rounded-md shadow-sm">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-1/2 rounded-r-none h-9 border-r-0 px-2",
                              field.value === true &&
                                "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                            )}
                            onClick={() =>
                              field.onChange(
                                field.value === true ? undefined : true
                              )
                            }
                            title="Chỉ lấy thành công"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-1/2 rounded-l-none h-9 px-2",
                              field.value === false &&
                                "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                            )}
                            onClick={() =>
                              field.onChange(
                                field.value === false ? undefined : false
                              )
                            }
                            title="Chỉ lấy thất bại"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <DialogFooter className="px-6 py-4 bg-muted/5 border-t border-border/40 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={exportMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={exportMutation.isPending}
                variant={"success"}
              >
                <Upload />
                {exportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử
                    lý...
                  </>
                ) : (
                  "Xuất Excel"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
