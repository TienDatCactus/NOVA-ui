import z from "zod";

// Enums for type safety
const AuditModuleEnum = z.enum([
  "UserManagement",
  "Booking",
  "Room",
  "FnB", // Food & Beverage (Menu và POS)
  "Service",
  "CustomerExperience",
  "Staff",
  "Financial",
  "Report",
  "Inventory",
  "SystemConfig",
  "Common",
]);

const AuditActionEnum = z.enum([
  "Create",
  "Update",
  "Delete",
  "Login",
  "Logout",
]);

// List Item Schema
const AuditListItemSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  userId: z.string().nullable(),
  username: z.string().nullable(),
  userRole: z.string().nullable(),
  module: AuditModuleEnum,
  moduleName: z.string(),
  action: AuditActionEnum,
  actionName: z.string(),
  entityName: z.string(),
  entityId: z.string().nullable(),
  entityCode: z.string().nullable(),
  description: z.string(),
  success: z.boolean(),
  errorMessage: z.string().nullable(),
  isArchived: z.boolean(),
});

// List Response Schema
const AuditListResponseSchema = z.object({
  items: z.array(AuditListItemSchema),
  totalCount: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// Changes Item Schema
const AuditChangesItemSchema = z.object({
  fieldName: z.string(),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
});

// Detail Schema
const AuditDetailSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  userId: z.string().nullable(),
  username: z.string().nullable(),
  userRole: z.string().nullable(),
  module: AuditModuleEnum,
  moduleName: z.string(),
  action: AuditActionEnum,
  actionName: z.string(),
  entityName: z.string(),
  entityId: z.string(),
  entityCode: z.string(),
  description: z.string(),
  changes: z.array(AuditChangesItemSchema),
  success: z.boolean(),
  errorMessage: z.string().nullable(),
  isArchived: z.boolean(),
  archivedAt: z.string().nullable(),
});

// List Query Params Schema

// Export Request Schema
const ExportAuditRequestSchema = z.object({
  fromDate: z.date("Ngày bắt đầu không hợp lệ").optional(),
  toDate: z.date("Ngày kết thúc không hợp lệ").optional(),
  userId: z.string("ID người dùng không hợp lệ").optional(),
  username: z.string("Tên người dùng không hợp lệ").optional(),
  module: AuditModuleEnum.optional(),
  action: AuditActionEnum.optional(),
  keyword: z.string("Từ khóa không hợp lệ").optional(),
  success: z.boolean("Trạng thái thành công không hợp lệ").optional(),
});

// Archive Request Schema
const ArchiveAuditRequestSchema = z.object({
  olderThanMonths: z.number().int().min(1).max(120).default(24),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

// Cleanup Request Schema
const CleanupAuditRequestSchema = z.object({
  olderThanMonths: z.number().int().min(1).max(120).default(24),
  confirmationText: z.string().refine((val) => val === "DELETE", {
    message: 'Bạn phải gõ chính xác "DELETE" để xác nhận',
  }),
  mustArchiveFirst: z.boolean().refine((val) => val === true, {
    message: "Bạn phải archive trước khi cleanup",
  }),
});

// Stats Schema
const AuditStatsSchema = z.object({
  StatsByModule: {
    UserManagement: z.number().int().nonnegative(),
    Booking: z.number().int().nonnegative(),
    Room: z.number().int().nonnegative(),
    FnB: z.number().int().nonnegative(),
    Service: z.number().int().nonnegative(),
    Staff: z.number().int().nonnegative(),
    Financial: z.number().int().nonnegative(),
    Inventory: z.number().int().nonnegative(),
  },
  OldestLogDate: z.string().nullable(),
  LogsNeedingCleanup: z.number().int().nonnegative(),
  RetentionMonths: z.number().int().nonnegative(),
  NextCleanupDate: z.string().nullable(),
});

// Export factory function
export const AuditSchema = {
  AuditListItemSchema,
  AuditListResponseSchema,
  AuditChangesItemSchema,
  AuditDetailSchema,
  ExportAuditRequestSchema,
  ArchiveAuditRequestSchema,
  CleanupAuditRequestSchema,
  AuditStatsSchema,
  // Enums
  AuditModuleEnum,
  AuditActionEnum,
};
