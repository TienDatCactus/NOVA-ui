export type UserRole =
  | "Receptionist"
  | "Staff"
  | "Customer"
  | "HotelManager"
  | "Accountant"
  | "Accounting"
  | "Admin"
  | "ServiceStaff";

export const roleDisplayNames: Record<string, string> = {
  Receptionist: "Lễ tân",
  Staff: "Nhân viên",
  HotelManager: "Quản lý",
  Accounting: "Kế toán",
  Admin: "Quản trị viên",
  ServiceStaff: "Nhân viên phục vụ",
};

export interface RoleBadgeColors {
  bg: string;
  text: string;
  border: string;
}

export const roleBadgeColors: Record<string, RoleBadgeColors> = {
  Receptionist: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Staff: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  HotelManager: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  Accounting: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  Admin: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  ServiceStaff: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
};

export const defaultRoleBadgeColors: RoleBadgeColors = {
  bg: "bg-gray-50",
  text: "text-gray-700",
  border: "border-gray-200",
};

export const getRoleBadgeColors = (role: string): RoleBadgeColors => {
  return roleBadgeColors[role] || defaultRoleBadgeColors;
};

export const getRoleDisplayName = (role: string): string => {
  return roleDisplayNames[role] || role;
};
