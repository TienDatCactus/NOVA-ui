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

const UserCell = ({ username }: { username?: string }) => {
  if (!username || username === "System") {
    return (
      <Avatar className="flex items-center gap-2 text-muted-foreground">
        <AvatarFallback className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-[10px] font-mono">SYS</span>
        </AvatarFallback>
        <span className="text-sm">Hệ thống</span>
      </Avatar>
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
      <Avatar className="h-8 w-8 border ring-1 ring-background group-hover:ring-primary/20 transition-all">
        <AvatarFallback className="text-xs font-semibold bg-primary/5 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-none truncate max-w-[150px]">
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

  const styleMap: Record<string, string> = {
    Create:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
    Update:
      "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300",
    Delete:
      "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300",
    Login: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    Logout: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
  };

  const defaultStyle = "border-border bg-background text-foreground";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 py-0.5 px-2 font-medium transition-colors cursor-default",
        styleMap[action] || defaultStyle
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      <span>{actionName}</span>
    </Badge>
  );
};

// Component hiển thị Entity với nút Copy ID
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
    <div className="flex flex-col gap-0.5 max-w-[200px]">
      <span className="text-sm font-medium truncate" title={name}>
        {name}
      </span>
      {code && (
        <div className="flex items-center gap-1 text-muted-foreground group/code">
          <code className="text-[10px] bg-muted px-1 py-0.5 rounded font-mono border">
            {code}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="opacity-0 group-hover/code:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
            title="Sao chép mã"
          >
            {copied ? (
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// --- 2. Main Columns Definition ---

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
          {/* Tabular nums giúp các con số thẳng hàng dọc */}
          <span className="text-sm font-medium font-mono tabular-nums">
            {format(new Date(timestamp), "HH:mm:ss", { locale: vi })}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {format(new Date(timestamp), "dd/MM/yyyy", { locale: vi })}
          </span>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người thực hiện" />
    ),
    cell: ({ row }) => <UserCell username={row.original.username || "—"} />,
    size: 200,
  },
  {
    accessorKey: "module",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phân hệ (Module)" />
    ),
    cell: ({ row }) => {
      const module = row.original.module;
      const moduleInfo = AuditModuleEnum.find((m) => m.value === module);
      const Icon = moduleInfo?.icon;

      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="p-1.5 bg-muted rounded-md border">
            {Icon ? (
              <Icon className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
          </div>
          <span>{row.original.moduleName}</span>
        </div>
      );
    },
    size: 150,
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
    size: 120,
  },
  {
    accessorKey: "entityName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đối tượng tác động" />
    ),
    cell: ({ row }) => (
      <EntityCell
        name={row.original.entityName}
        code={row.original.entityCode || undefined}
      />
    ),
    size: 200,
  },

  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chi tiết" />
    ),
    cell: ({ row }) => {
      const description = row.original.description;
      if (!description)
        return <span className="text-muted-foreground/50">—</span>;

      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground line-clamp-2 max-w-[300px] cursor-help">
                {description}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] break-words">
              <p className="text-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [detailDialogOpen, setDetailDialogOpen] = useState(false);
      return (
        <>
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={() => setDetailDialogOpen(true)}
          >
            <BadgeInfo />
          </Button>
          <AuditDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            auditLogId={row.original.id}
          />
        </>
      );
    },
  },
];
