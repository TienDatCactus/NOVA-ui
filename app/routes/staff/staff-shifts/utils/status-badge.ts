import { CheckCircle2, Clock, UserX, type LucideIcon } from "lucide-react";

/**
 * Shared utility for getting badge variant, label, and icon based on attendance status
 * Used by unified schedule table component
 */
export const getStatusBadge = (status?: string) => {
  if (!status || status.toLowerCase() === "assigned") {
    return {
      variant: "secondary" as const,
      label: "Chưa chấm",
      icon: Clock as LucideIcon,
      showLabel: true,
    };
  }
  if (status.toLowerCase() === "present") {
    return {
      variant: "default" as const,
      label: "Đã điểm danh",
      icon: CheckCircle2 as LucideIcon,
      showLabel: true, // Always show badge for present status
    };
  }
  if (status.toLowerCase() === "absent") {
    return {
      variant: "destructive" as const,
      label: "Vắng mặt",
      icon: UserX as LucideIcon,
      showLabel: true,
    };
  }
  return {
    variant: "secondary" as const,
    label: status,
    icon: Clock as LucideIcon,
    showLabel: true,
  };
};
