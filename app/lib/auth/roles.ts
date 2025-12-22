export enum UserRole {
  Admin = "Admin",
  HotelManager = "HotelManager",
  Accountant = "Accountant",
  Receptionist = "Receptionist",
  ServiceStaff = "ServiceStaff",
}

// Type-safe role array
export const ALL_ROLES = Object.values(UserRole);

// Role hierarchy (cao → thấp, để tính toán permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.Admin]: 5,
  [UserRole.HotelManager]: 4,
  [UserRole.Accountant]: 3,
  [UserRole.Receptionist]: 2,
  [UserRole.ServiceStaff]: 1,
};

// Role display names (Vietnamese)
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: "Quản trị viên",
  [UserRole.HotelManager]: "Quản lý khách sạn",
  [UserRole.Accountant]: "Kế toán",
  [UserRole.Receptionist]: "Lễ tân",
  [UserRole.ServiceStaff]: "Nhân viên phục vụ",
};

// Route modules (mapping với url.ts structure)
export enum RouteModule {
  Auth = "auth",
  Users = "users",
  Bookings = "bookings",
  Rooms = "rooms",
  RoomTypes = "room-types",
  Menu = "menu",
  MenuCategories = "menu-categories",
  Services = "services",
  ServiceTypes = "service-types",
  Orders = "orders",
  Invoices = "invoices",
  Chat = "chat",
  Staff = "staff",
  StaffRoles = "staff-roles",
  WorkShifts = "work-shifts",
  Holidays = "holidays",
  StaffShifts = "staff-shifts",
  StaffAttendance = "staff-attendance",
  Payroll = "payroll",
  Stock = "stock",
  Expenses = "expenses",
  Refunds = "refunds",
  FinancialReports = "financial-reports",
  AuditLogs = "audit-logs",
  Configs = "configs",
  Units = "units",
  Reports = "reports",
  Translation = "translation",
}

// Permission types
export enum Permission {
  Read = "read",
  Create = "create",
  Update = "update",
  Delete = "delete",
  Execute = "execute",
}

// Module permissions mapping (dựa trên phân tích url.ts)
export const MODULE_PERMISSIONS: Record<
  RouteModule,
  Partial<Record<UserRole, Permission[]>>
> = {
  [RouteModule.Auth]: {
    [UserRole.Admin]: [Permission.Read, Permission.Execute, Permission.Update],
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Execute,
      Permission.Update,
    ],
    [UserRole.Accountant]: [
      Permission.Read,
      Permission.Execute,
      Permission.Update,
    ],
    [UserRole.Receptionist]: [Permission.Read, Permission.Execute],
    [UserRole.ServiceStaff]: [Permission.Read, Permission.Execute],
  },

  [RouteModule.Users]: {
    [UserRole.Admin]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
  },

  // Bookings - Receptionist full access
  [RouteModule.Bookings]: {
    [UserRole.Receptionist]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
    [UserRole.HotelManager]: [Permission.Read],
  },

  // Rooms - Receptionist read, HotelManager full
  [RouteModule.Rooms]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
    [UserRole.Receptionist]: [Permission.Read],
    [UserRole.ServiceStaff]: [Permission.Read],
  },

  // Room Types - Same as Rooms
  [RouteModule.RoomTypes]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
    [UserRole.Receptionist]: [Permission.Read],
    [UserRole.ServiceStaff]: [Permission.Read],
  },

  [RouteModule.Menu]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ],
    [UserRole.Receptionist]: [Permission.Read],
  },

  // Menu Categories - ServiceStaff can create, HotelManager full
  [RouteModule.MenuCategories]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ],
    [UserRole.Receptionist]: [Permission.Read],
  },

  [RouteModule.Services]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ],
    [UserRole.Receptionist]: [Permission.Read],
  },

  // Service Types - Same as Services
  [RouteModule.ServiceTypes]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ],
    [UserRole.Receptionist]: [Permission.Read],
  },

  // Orders - Receptionist full access
  [RouteModule.Orders]: {
    [UserRole.Receptionist]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
    [UserRole.ServiceStaff]: [Permission.Read],
  },

  // Invoices - Accountant full, Receptionist limited
  [RouteModule.Invoices]: {
    [UserRole.Accountant]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
  },

  // Chat - ServiceStaff + Receptionist + HotelManager
  [RouteModule.Chat]: {
    [UserRole.HotelManager]: [Permission.Read, Permission.Execute], // Assign, close
    [UserRole.Receptionist]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
    ],
    [UserRole.ServiceStaff]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
    ],
  },

  // Staff - HotelManager full, Accountant read
  [RouteModule.Staff]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
    [UserRole.Accountant]: [Permission.Read], // For payroll
  },

  // Staff Roles - HotelManager ONLY
  [RouteModule.StaffRoles]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ],
  },

  // Work Shifts - HotelManager full, others read
  [RouteModule.WorkShifts]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ],
  },

  // Holidays - HotelManager ONLY
  [RouteModule.Holidays]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ],
  },

  // Staff Shifts - HotelManager ONLY
  [RouteModule.StaffShifts]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
  },

  // Staff Attendance - HotelManager ONLY
  [RouteModule.StaffAttendance]: {
    [UserRole.HotelManager]: [Permission.Read, Permission.Execute],
  },

  // Payroll - Accountant full, HotelManager read
  [RouteModule.Payroll]: {
    [UserRole.Accountant]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
    [UserRole.HotelManager]: [Permission.Read, Permission.Execute], // View + refresh
  },

  // Stock - ServiceStaff create/request, HotelManager approve
  [RouteModule.Stock]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
    [UserRole.ServiceStaff]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ],
  },

  // Expenses - Accountant full, HotelManager read
  [RouteModule.Expenses]: {
    [UserRole.Accountant]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.Execute,
    ],
    [UserRole.HotelManager]: [Permission.Read],
  },

  // Refunds - HotelManager ONLY
  [RouteModule.Refunds]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Execute,
    ],
  },

  // Financial Reports - HotelManager ONLY
  [RouteModule.FinancialReports]: {
    [UserRole.HotelManager]: [Permission.Read],
  },

  // Audit Logs - Admin ONLY
  [RouteModule.AuditLogs]: {
    [UserRole.Admin]: [
      Permission.Read,
      Permission.Execute,
      Permission.Delete,
      Permission.Update,
    ],
  },

  // Configs - Admin full, HotelManager limited
  [RouteModule.Configs]: {
    [UserRole.Admin]: [Permission.Read, Permission.Update, Permission.Delete],
    [UserRole.HotelManager]: [Permission.Read, Permission.Update],
  },

  // Units - HotelManager full, others read
  [RouteModule.Units]: {
    [UserRole.HotelManager]: [
      Permission.Read,
      Permission.Create,
      Permission.Update,
      Permission.Delete,
    ],
    [UserRole.ServiceStaff]: [Permission.Read],
  },

  // Reports - HotelManager + Receptionist
  [RouteModule.Reports]: {
    [UserRole.HotelManager]: [Permission.Read],
    [UserRole.Receptionist]: [Permission.Read],
  },

  // Translation - All users
  [RouteModule.Translation]: {
    [UserRole.Admin]: [Permission.Read, Permission.Execute],
    [UserRole.HotelManager]: [Permission.Read, Permission.Execute],
    [UserRole.Accountant]: [Permission.Read, Permission.Execute],
    [UserRole.Receptionist]: [Permission.Read, Permission.Execute],
    [UserRole.ServiceStaff]: [Permission.Read, Permission.Execute],
  },
};
