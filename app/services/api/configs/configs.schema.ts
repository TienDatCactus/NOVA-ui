import z from "zod";

const ConfigListItemSchema = z.object({
  module: z.string(),
  group: z.string(),
  key: z.string(),
  dataType: z.string(),
  currentValue: z.string(),
  defaultValue: z.string(),
  description: z.string(),
  isUsingCustomValue: z.boolean(),
});

const ConfigListResponseSchema = z.array(ConfigListItemSchema);

const ConfigGroupItemSchema = z.object({
  key: z.string(),
  shortKey: z.string(),
  displayName: z.string(),
  dataType: z.string(),
  currentValue: z.string(),
  defaultValue: z.string(),
  description: z.string(),
  isUsingCustomValue: z.boolean(),
});

const ConfigGroupSchema = z.object({
  group: z.string(),
  groupDisplayName: z.string(),
  items: z.array(ConfigGroupItemSchema),
});
const GroupedConfigListItemSchema = z.object({
  module: z.string(),
  moduleDisplayName: z.string(),
  groups: z.array(ConfigGroupSchema),
});

const GroupedConfigListResponseSchema = z.array(GroupedConfigListItemSchema);

const ConfigTimezoneListResponseSchema = z.object({
  currentTimeZoneId: z.string(),
  timeZones: z.array(
    z.object({
      id: z.string(),
      displayName: z.string(),
      standardName: z.string(),
      baseUtcOffsetHours: z.number(),
    })
  ),
});

const ConfigDetailSchema = ConfigListItemSchema;

const UpdateConfigRequestSchema = z.object({
  value: z.string(),
  description: z.string().optional(),
});

// Export schemas as factory
export const ConfigSchema = {
  ConfigListItemSchema,
  ConfigListResponseSchema,
  ConfigGroupItemSchema,
  GroupedConfigListItemSchema,
  GroupedConfigListResponseSchema,
  ConfigTimezoneListResponseSchema,
  ConfigDetailSchema,
  UpdateConfigRequestSchema,
  ConfigGroupSchema,
};
