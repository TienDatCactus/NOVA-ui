import { Hand, Building2, Package, Briefcase } from "lucide-react";
import { Badge } from "~/components/ui/badge";

type ExpenseSourceType =
  | "Manual"
  | "StaffPayroll"
  | "Procurement"
  | "OtherModule";

interface SourceTypeBadgeProps {
  sourceType: ExpenseSourceType;
}

const SOURCE_TYPE_CONFIG: Record<
  ExpenseSourceType,
  {
    label: string;
    variant: "default" | "secondary" | "info" | "outline";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Manual: {
    label: "Nhập tay",
    variant: "default",
    icon: Hand,
  },
  StaffPayroll: {
    label: "Lương NV",
    variant: "secondary",
    icon: Briefcase,
  },
  Procurement: {
    label: "Nhập hàng",
    variant: "info",
    icon: Package,
  },
  OtherModule: {
    label: "Module khác",
    variant: "outline",
    icon: Building2,
  },
};

export default function SourceTypeBadge({ sourceType }: SourceTypeBadgeProps) {
  const config = SOURCE_TYPE_CONFIG[sourceType];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
