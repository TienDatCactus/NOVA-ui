import type { z } from "zod";
import { CustomerSchema } from "~/services/schema/customer.schema";

const {
  CustomerItemSchema,
  CustomerListResponseSchema,
  CustomerDetailResponseSchema,
  CreateCustomerSchema,
  CreateCustomerResponseSchema,
  UpdateCustomerSchema,
  UpdateCustomerResponseSchema,
  RoleListResponseSchema,
  LockUserSchema,
  LockUserResponseSchema,
  UnlockUserResponseSchema,
  AssignRolesSchema,
  AssignRolesResponseSchema,
  RemoveRolesSchema,
  RemoveRolesResponseSchema,
  ChangePasswordSchema,
  ChangePasswordResponseSchema,
} = CustomerSchema;

// Customer Item
export type CustomerItem = z.infer<typeof CustomerItemSchema>;

// API Response Types
export type CustomerListResponseDto = z.infer<
  typeof CustomerListResponseSchema
>;
export type CustomerDetailResponseDto = z.infer<
  typeof CustomerDetailResponseSchema
>;
export type CreateCustomerResponseDto = z.infer<
  typeof CreateCustomerResponseSchema
>;
export type UpdateCustomerResponseDto = z.infer<
  typeof UpdateCustomerResponseSchema
>;
export type RoleListResponseDto = z.infer<typeof RoleListResponseSchema>;
export type LockUserResponseDto = z.infer<typeof LockUserResponseSchema>;
export type UnlockUserResponseDto = z.infer<typeof UnlockUserResponseSchema>;
export type AssignRolesResponseDto = z.infer<typeof AssignRolesResponseSchema>;
export type RemoveRolesResponseDto = z.infer<typeof RemoveRolesResponseSchema>;

// Request Body Types
export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;
export type LockUserDto = z.infer<typeof LockUserSchema>;
export type AssignRolesDto = z.infer<typeof AssignRolesSchema>;
export type RemoveRolesDto = z.infer<typeof RemoveRolesSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type ChangePasswordResponseDto = z.infer<
  typeof ChangePasswordResponseSchema
>;
