import type z from "zod";
import type { AuditSchema } from "./audit.schema";
import {
  Users,
  CalendarCheck,
  DoorOpen,
  UtensilsCrossed,
  Briefcase,
  Star,
  UserCircle,
  Wallet,
  FileText,
  Package,
  Settings,
  Grid,
  Plus,
  Edit,
  Trash2,
  LogIn,
  LogOut,
} from "lucide-react";

export type AuditListParams = {
  Page?: number;
  PageSize?: number;

  FromDate?: string;
  ToDate?: string;

  Module?: z.infer<typeof AuditSchema.AuditModuleEnum>;
  Action?: z.infer<typeof AuditSchema.AuditActionEnum>;
  UserId?: string;
  Username?: string;
  Keyword?: string;
  Success?: boolean;
  IsArchived?: boolean;
};

export const AuditModuleEnum = [
  {
    value: "UserManagement",
    label: "Quản lý người dùng",
    code: "USER",
    icon: Users,
  },
  {
    value: "Booking",
    label: "Đặt phòng",
    code: "BOOK",
    icon: CalendarCheck,
  },
  {
    value: "Room",
    label: "Phòng",
    code: "ROOM",
    icon: DoorOpen,
  },
  {
    value: "FnB",
    label: "Ăn uống",
    code: "FNB",
    icon: UtensilsCrossed,
  },
  {
    value: "Service",
    label: "Dịch vụ",
    code: "SRV",
    icon: Briefcase,
  },
  {
    value: "CustomerExperience",
    label: "Trải nghiệm khách hàng",
    code: "CX",
    icon: Star,
  },
  {
    value: "Staff",
    label: "Nhân viên",
    code: "STAFF",
    icon: UserCircle,
  },
  {
    value: "Financial",
    label: "Tài chính",
    code: "FIN",
    icon: Wallet,
  },
  {
    value: "Report",
    label: "Báo cáo",
    code: "RPT",
    icon: FileText,
  },
  {
    value: "Inventory",
    label: "Kho",
    code: "INV",
    icon: Package,
  },
  {
    value: "SystemConfig",
    label: "Cấu hình hệ thống",
    code: "SYS",
    icon: Settings,
  },
  {
    value: "Common",
    label: "Chung",
    code: "COM",
    icon: Grid,
  },
] as const;

export const AuditActionEnum = [
  {
    value: "Create",
    label: "Tạo mới",
    code: "CRT",
    icon: Plus,
  },
  {
    value: "Update",
    label: "Cập nhật",
    code: "UPD",
    icon: Edit,
  },
  {
    value: "Delete",
    label: "Xóa",
    code: "DEL",
    icon: Trash2,
  },
  {
    value: "Login",
    label: "Đăng nhập",
    code: "LGI",
    icon: LogIn,
  },
  {
    value: "Logout",
    label: "Đăng xuất",
    code: "LGO",
    icon: LogOut,
  },
] as const;
