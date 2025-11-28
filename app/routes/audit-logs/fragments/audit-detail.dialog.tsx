import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Activity,
  Calendar,
  Code,
  FileDiff,
  Info,
  Laptop,
  LayoutGrid,
  MapPin,
  MousePointerClick,
  ScrollText,
  User,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import {
  AuditModuleEnum,
  AuditActionEnum,
} from "~/services/api/audit/audit.types";
import { useAuditDetail } from "../container/query.hooks";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

interface AuditDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditLogId: string | null;
}

// Component hiển thị giá trị: Text thường hoặc JSON
const ValueDisplay = ({ value, type }: { value: any; type: "old" | "new" }) => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground italic text-xs">Empty</span>;
  }

  // Nếu là object/array, hiển thị dạng code block
  if (typeof value === "object") {
    return (
      <pre
        className={cn(
          "text-[10px] font-mono p-2 rounded border overflow-x-auto max-w-[300px]",
          type === "old"
            ? "bg-red-50 text-red-700 border-red-100"
            : "bg-green-50 text-green-700 border-green-100"
        )}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return (
    <span
      className={cn(
        "break-all",
        type === "old"
          ? "text-red-600 line-through decoration-red-300"
          : "text-green-600 font-medium"
      )}
    >
      {String(value)}
    </span>
  );
};

export default function AuditDetailDialog({
  open,
  onOpenChange,
  auditLogId,
}: AuditDetailDialogProps) {
  const { data, isPending } = useAuditDetail(auditLogId || "", {
    enabled: !!auditLogId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-y-auto max-h-[90vh] flex flex-col">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileDiff className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Chi tiết truy vết</DialogTitle>
              {data && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  ID: <span className="font-mono text-xs">{data.id}</span>
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {isPending ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-60 w-full" />
          </div>
        ) : data ? (
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {/* 1. OVERVIEW CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* User Info */}
                <div className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <User className="w-4 h-4" /> Người thực hiện
                  </div>
                  <div>
                    <div className="font-medium text-base">
                      {data.username || "System"}
                    </div>
                    {data.userRole && (
                      <Badge
                        variant="secondary"
                        className="mt-1 text-[10px] h-5 px-1.5"
                      >
                        {data.userRole}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Context Info */}
                <div className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <LayoutGrid className="w-4 h-4" /> Ngữ cảnh
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <LayoutGrid className="w-3 h-3" /> Module
                      </span>
                      <span className="font-medium">{data.moduleName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <MousePointerClick className="w-3 h-3" /> Action
                      </span>
                      <span className="font-medium">{data.actionName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Time
                      </span>
                      <span className="font-mono text-xs">
                        {format(
                          new Date(data.timestamp),
                          "HH:mm:ss dd/MM/yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Info */}
                <div className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <MapPin className="w-4 h-4" /> Đối tượng
                  </div>
                  <div>
                    <div
                      className="font-medium text-base truncate"
                      title={data.entityName}
                    >
                      {data.entityName}
                    </div>
                    {data.entityCode && (
                      <code className="block mt-1 text-xs bg-muted px-1.5 py-0.5 rounded w-fit border font-mono">
                        {data.entityCode}
                      </code>
                    )}
                  </div>
                  <div className="pt-2">
                    <Badge
                      variant={data.success ? "success" : "destructive"}
                      className="h-5"
                    >
                      {data.success ? "Thành công" : "Thất bại"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 2. DESCRIPTION & ERROR */}
              {(data.description || data.errorMessage) && (
                <div className="space-y-4">
                  {data.description && (
                    <div className="bg-muted/30 rounded-lg p-3 border">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" /> Mô tả chi tiết
                      </h4>
                      <p className="text-sm">{data.description}</p>
                    </div>
                  )}

                  {data.errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-200 dark:border-red-900">
                      <h4 className="text-xs font-semibold uppercase text-red-600 mb-1 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Lỗi hệ thống
                      </h4>
                      <p className="text-sm font-mono text-red-700 dark:text-red-400 break-words">
                        {data.errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. CHANGES TABLE (The Meat) */}
              {data.changes && data.changes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Dữ liệu thay đổi{" "}
                    <Badge variant="secondary" className="ml-1">
                      {data.changes.length}
                    </Badge>
                  </h4>

                  <div className="rounded-lg border overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[180px]">
                            Trường dữ liệu
                          </TableHead>
                          <TableHead className="w-[35%] text-red-600">
                            Giá trị cũ
                          </TableHead>
                          <TableHead className="text-green-600">
                            Giá trị mới
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.changes.map((change, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-transparent"
                          >
                            <TableCell className="font-medium align-top py-3">
                              <div className="flex items-center gap-1.5">
                                <Code className="w-3 h-3 text-muted-foreground" />
                                {change.fieldName}
                              </div>
                            </TableCell>
                            <TableCell className="align-top py-3 bg-red-50/10">
                              <ValueDisplay
                                value={change.oldValue}
                                type="old"
                              />
                            </TableCell>
                            <TableCell className="align-top py-3 bg-green-50/10">
                              <ValueDisplay
                                value={change.newValue}
                                type="new"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {(!data.changes || data.changes.length === 0) && data.success && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border rounded-xl border-dashed">
                  <ScrollText className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">
                    Không có thay đổi dữ liệu nào được ghi nhận
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <div className="p-3 bg-muted rounded-full">
              <FileDiff className="h-6 w-6 opacity-50" />
            </div>
            <p>Không tìm thấy dữ liệu</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
