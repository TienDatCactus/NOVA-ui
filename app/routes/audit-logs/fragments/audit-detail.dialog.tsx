import {
  AlertCircle,
  ArrowRight,
  Clock,
  LayoutGrid,
  MapPin,
  User,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { useAuditDetail } from "../container/query.hooks";

interface AuditDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditLogId: string | null;
}

// Minimal Value Display
const ValueDisplay = ({ value, type }: { value: any; type: "old" | "new" }) => {
  if (value === null || value === undefined || value === "") {
    return (
      <span className="text-muted-foreground/30 italic text-xs">Empty</span>
    );
  }

  if (typeof value === "object") {
    return (
      <pre className="text-[10px] font-mono bg-muted/30 p-2 rounded max-w-[300px] overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return (
    <span
      className={cn(
        "text-sm break-all",
        type === "old"
          ? "text-muted-foreground line-through decoration-muted-foreground/30"
          : "text-foreground font-medium"
      )}
    >
      {String(value)}
    </span>
  );
};

// Helper for metadata rows
const MetaRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center text-sm">
    <div className="w-28 flex items-center text-muted-foreground gap-2 shrink-0">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
    <div className="flex-1 truncate font-medium">{value}</div>
  </div>
);

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
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-none shadow-xl">
        <DialogHeader className="px-6 py-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              Chi tiết truy vấn
            </DialogTitle>
            {data && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {data.id}
              </span>
            )}
          </div>
        </DialogHeader>

        {isPending ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full mt-4" />
          </div>
        ) : data ? (
          <ScrollArea className="max-h-[80vh]">
            <div className="p-6 space-y-8">
              {/* 1. METADATA SECTION: Clean List */}
              <div className="space-y-3">
                <MetaRow
                  icon={User}
                  label="Actor"
                  value={
                    <span className="flex items-center gap-2">
                      {data.username || "System"}
                      {data.userRole && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1 font-normal text-muted-foreground"
                        >
                          {data.userRole}
                        </Badge>
                      )}
                    </span>
                  }
                />
                <MetaRow
                  icon={Clock}
                  label="Timestamp"
                  value={
                    <span className="font-mono text-xs text-muted-foreground">
                      {new Date(data.timestamp).toLocaleString()}
                    </span>
                  }
                />
                <MetaRow
                  icon={LayoutGrid}
                  label="Action"
                  value={
                    <span>
                      {data.moduleName}{" "}
                      <span className="text-muted-foreground mx-1">•</span>{" "}
                      {data.actionName}
                    </span>
                  }
                />
                <MetaRow
                  icon={MapPin}
                  label="Target"
                  value={
                    <div className="flex items-center gap-2">
                      {data.entityName}
                      {data.entityCode && (
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-1 rounded">
                          {data.entityCode}
                        </span>
                      )}
                      <Badge
                        variant={data.success ? "secondary" : "destructive"}
                        className="h-4 text-[10px] px-1.5 ml-auto"
                      >
                        {data.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  }
                />
              </div>

              {/* 2. ERROR / DESCRIPTION */}
              {(data.errorMessage || data.description) && (
                <div
                  className={cn(
                    "p-3 rounded text-sm border",
                    data.errorMessage
                      ? "bg-red-50/50 border-red-100 text-red-600"
                      : "bg-muted/20 border-border/50 text-muted-foreground"
                  )}
                >
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{data.errorMessage || data.description}</p>
                  </div>
                </div>
              )}

              {/* 3. CHANGES: Minimalist Comparison */}
              {data.changes && data.changes.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground pb-2 border-b border-border/40">
                    Data Changes
                  </h4>
                  <div className="space-y-6">
                    {data.changes.map((change, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[120px_1fr] gap-4 text-sm"
                      >
                        <div
                          className="text-muted-foreground font-medium pt-1 truncate"
                          title={change.fieldName}
                        >
                          {change.fieldName}
                        </div>
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                          <div className="flex-1 bg-muted/20 p-2 rounded min-h-[32px] flex items-center">
                            <ValueDisplay value={change.oldValue} type="old" />
                          </div>
                          <ArrowRight className="w-3 h-3 text-muted-foreground/30 shrink-0 rotate-90 sm:rotate-0" />
                          <div className="flex-1 bg-green-50/30 dark:bg-green-900/10 p-2 rounded min-h-[32px] flex items-center border border-green-100/50 dark:border-green-900/30">
                            <ValueDisplay value={change.newValue} type="new" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                data.success && (
                  <div className="text-center py-8 text-sm text-muted-foreground/50 italic">
                    No data changes recorded.
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Data not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
