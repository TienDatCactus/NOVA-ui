import type { z } from "zod";
import { UserSchema } from "~/services/schema/user.schema";

const {
  UserItemSchema,
  UserListResponseSchema,
  UserDetailResponseSchema,
  CreateUserSchema,
  CreateUserResponseSchema,
  UpdateUserSchema,
  UpdateUserResponseSchema,
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
} = UserSchema;

// User Item
export type UserItem = z.infer<typeof UserItemSchema>;

// API Response Types
export type UserListResponseDto = z.infer<typeof UserListResponseSchema>;
export type UserDetailResponseDto = z.infer<typeof UserDetailResponseSchema>;
export type CreateUserResponseDto = z.infer<typeof CreateUserResponseSchema>;
export type UpdateUserResponseDto = z.infer<typeof UpdateUserResponseSchema>;
export type RoleListResponseDto = z.infer<typeof RoleListResponseSchema>;
export type LockUserResponseDto = z.infer<typeof LockUserResponseSchema>;
export type UnlockUserResponseDto = z.infer<typeof UnlockUserResponseSchema>;
export type AssignRolesResponseDto = z.infer<typeof AssignRolesResponseSchema>;
export type RemoveRolesResponseDto = z.infer<typeof RemoveRolesResponseSchema>;

// Request Body Types
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type LockUserDto = z.infer<typeof LockUserSchema>;
export type AssignRolesDto = z.infer<typeof AssignRolesSchema>;
export type RemoveRolesDto = z.infer<typeof RemoveRolesSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type ChangePasswordResponseDto = z.infer<
  typeof ChangePasswordResponseSchema
>;
