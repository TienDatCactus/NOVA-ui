import type z from "zod";
import { ConfigSchema } from "./configs.schema";

const {
  ConfigDetailSchema,
  ConfigGroupItemSchema,
  ConfigListItemSchema,
  ConfigListResponseSchema,
  GroupedConfigListItemSchema,
  GroupedConfigListResponseSchema,
  ConfigTimezoneListResponseSchema,
  UpdateConfigRequestSchema,
} = ConfigSchema;

export type ConfigListItem = z.infer<typeof ConfigListItemSchema>;
export type ConfigListResponse = z.infer<typeof ConfigListResponseSchema>;

export type ConfigGroupItem = z.infer<typeof ConfigGroupItemSchema>;
export type GroupedConfigListItem = z.infer<typeof GroupedConfigListItemSchema>;
export type GroupedConfigListResponse = z.infer<
  typeof GroupedConfigListResponseSchema
>;

export type ConfigTimezoneListResponse = z.infer<
  typeof ConfigTimezoneListResponseSchema
>;

export type ConfigDetail = z.infer<typeof ConfigDetailSchema>;

export type UpdateConfigRequest = z.infer<typeof UpdateConfigRequestSchema>;
