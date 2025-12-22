import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, BadgeInfo, CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import {
  AuditActionEnum,
  AuditModuleEnum,
} from "~/services/api/audit/audit.types";
import type { AuditListItem } from "~/services/api/audit/dto";
import AuditDetailDialog from "../../fragments/audit-detail.dialog";

// --- Helper Components ---

const UserCell = ({ username }: { username?: string }) => {
  if (!username || username === "System") {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border">
          <span className="text-[10px] font-mono font-bold">SYS</span>
        </div>
        <span className="text-sm font-medium">Hệ thống</span>
      </div>
    );
  }

  const initials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 group">
      <Avatar className="h-8 w-8 border ring-1 ring-background transition-all group-hover:ring-offset-2">
        <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span
          className="text-sm font-medium leading-none truncate max-w-[140px]"
          title={username}
        >
          {username}
        </span>
      </div>
    </div>
  );
};

const ActionBadge = ({
  action,
  actionName,
}: {
  action: string;
  actionName: string;
}) => {
  const actionInfo = AuditActionEnum.find((a) => a.value === action);
  const Icon = actionInfo?.icon;

  // Modern, professional color palette based on action semantics
  const styleMap: Record<string, string> = {
    Create:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
    Update:
      "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
    Delete:
      "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900",
    Login:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900",
    Logout:
      "border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800",
  };

  const defaultStyle = "border-border bg-muted text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 py-0.5 px-2.5 font-medium transition-colors cursor-default border shadow-sm",
        styleMap[action] || defaultStyle
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{actionName}</span>
    </Badge>
  );
};

const EntityCell = ({ name, code }: { name: string; code?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Đã sao chép mã đối tượng");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1 max-w-[220px]">
      <span
        className="text-sm font-medium truncate text-foreground"
        title={name}
      >
        {name}
      </span>
      {code && (
        <div className="flex items-center gap-1.5 text-muted-foreground group/code">
          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono border border-border/50">
            {code}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-5 w-5 opacity-0 group-hover/code:opacity-100 transition-opacity hover:bg-muted rounded focus:opacity-100"
            title="Sao chép mã"
          >
            {copied ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// --- Columns Definition ---

export const columns: ColumnDef<AuditListItem>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thời gian" />
    ),
    cell: ({ row }) => {
      const timestamp = row.original.timestamp;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium font-mono tabular-nums text-foreground">
            {format(new Date(timestamp), "HH:mm:ss", { locale: vi })}
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {format(new Date(timestamp), "dd/MM/yyyy", { locale: vi })}
          </span>
        </div>
      );
    },
    size: 110,
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người thực hiện" />
    ),
    cell: ({ row }) => (
      <UserCell
        username={
          row.original.userRole ||
          row.original.username ||
          row.original.userId ||
          ""
        }
      />
    ),
    size: 220,
  },
  {
    accessorKey: "module",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phân hệ" />
    ),
    cell: ({ row }) => {
      const module = row.original.module;
      const moduleInfo = AuditModuleEnum.find((m) => m.value === module);
      const Icon = moduleInfo?.icon;

      return (
        <div className="flex items-center gap-2.5 text-sm text-foreground/80">
          <div className="flex items-center justify-center h-7 w-7 rounded-md border bg-background shadow-sm text-muted-foreground">
            {Icon ? (
              <Icon className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
          </div>
          <span className="font-medium">{row.original.moduleName}</span>
        </div>
      );
    },
    size: 180,
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hành động" />
    ),
    cell: ({ row }) => (
      <ActionBadge
        action={row.original.action}
        actionName={row.original.actionName}
      />
    ),
    size: 140,
  },
  {
    accessorKey: "entityName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đối tượng" />
    ),
    cell: ({ row }) => (
      <EntityCell
        name={row.original.entityName}
        code={row.original.entityCode || undefined}
      />
    ),
    size: 240,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chi tiết" />
    ),
    cell: ({ row }) => {
      const description = row.original.description;
      if (!description)
        return <span className="text-muted-foreground/40 italic">—</span>;

      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground line-clamp-2 max-w-[280px] cursor-help hover:text-foreground transition-colors">
                {description}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] break-words p-3">
              <p className="text-xs leading-relaxed">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Thao tác</span>,
    cell: ({ row }) => {
      const [detailDialogOpen, setDetailDialogOpen] = useState(false);
      return (
        <div className="flex justify-end pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => setDetailDialogOpen(true)}
          >
            <BadgeInfo className="h-4 w-4" />
            <span className="sr-only">Xem chi tiết</span>
          </Button>
          <AuditDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            auditLogId={row.original.id}
          />
        </div>
      );
    },
    size: 50,
    enableSorting: false,
  },
];
