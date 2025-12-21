import {
  ShoppingCart,
  Wallet,
  Zap,
  Wrench,
  Megaphone,
  Building,
  MoreHorizontal,
} from "lucide-react";

export interface ExpenseListParams {
  fromDate?: string;
  toDate?: string;
  category?: string;
}

export const ExpenseCategories = [
  {
    value: "Procurement",
    label: "Thu mua",
    icon: ShoppingCart,
  },
  {
    value: "Salary",
    label: "Lương",
    icon: Wallet,
  },
  {
    value: "Utilities",
    label: "Tiện ích",
    icon: Zap,
  },
  {
    value: "Maintenance",
    label: "Bảo trì",
    icon: Wrench,
  },
  {
    value: "Marketing",
    label: "Tiếp thị",
    icon: Megaphone,
  },
  {
    value: "Office",
    label: "Văn phòng",
    icon: Building,
  },
  {
    value: "Other",
    label: "Khác",
    icon: MoreHorizontal,
  },
] as const;
