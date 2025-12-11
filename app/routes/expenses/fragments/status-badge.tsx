import { CheckCircle2, FileEdit, XCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";

type ExpenseStatus = "Draft" | "Posted" | "Voided";

interface StatusBadgeProps {
  status: ExpenseStatus;
}

const STATUS_CONFIG: Record<
  ExpenseStatus,
  {
    label: string;
    variant: "warning" | "success" | "destructive";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Draft: {
    label: "Nháp",
    variant: "warning",
    icon: FileEdit,
  },
  Posted: {
    label: "Đã chốt",
    variant: "success",
    icon: CheckCircle2,
  },
  Voided: {
    label: "Đã hủy",
    variant: "destructive",
    icon: XCircle,
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
