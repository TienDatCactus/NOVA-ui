import type z from "zod";
import { AuditSchema } from "./audit.schema";

// Type exports using z.infer
export type AuditModule = z.infer<typeof AuditSchema.AuditModuleEnum>;
export type AuditAction = z.infer<typeof AuditSchema.AuditActionEnum>;

export type AuditListItem = z.infer<typeof AuditSchema.AuditListItemSchema>;
export type AuditListResponse = z.infer<
  typeof AuditSchema.AuditListResponseSchema
>;

export type AuditChangesItem = z.infer<
  typeof AuditSchema.AuditChangesItemSchema
>;
export type AuditDetail = z.infer<typeof AuditSchema.AuditDetailSchema>;

export type ExportAuditRequest = z.infer<
  typeof AuditSchema.ExportAuditRequestSchema
>;
export type ArchiveAuditRequest = z.infer<
  typeof AuditSchema.ArchiveAuditRequestSchema
>;
export type CleanupAuditRequest = z.infer<
  typeof AuditSchema.CleanupAuditRequestSchema
>;

export type AuditStats = z.infer<typeof AuditSchema.AuditStatsSchema>;
