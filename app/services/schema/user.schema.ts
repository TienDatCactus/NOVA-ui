import { z } from "zod";

// Base User Item Schema (for list and detail responses)
const UserItemSchema = z
  .object({
    id: z.string(),
    userName: z.string(),
    email: z.string(),
    fullName: z.string(),
    phoneNumber: z
      .string()
      .nullable()
      .optional()
      .transform((val) => val || ""),
    emailConfirmed: z.boolean(),
    lockoutEnabled: z.boolean(),
    lockoutEnd: z.union([z.string(), z.null()]).optional(),
    roles: z.array(z.string()),
  })
  .passthrough();

// GET /api/Users - List response
const UserListResponseSchema = z.array(UserItemSchema);

// GET /api/Users/{id} - Detail response
const UserDetailResponseSchema = UserItemSchema;

// POST /api/Users - Create request body
const CreateUserSchema = z.object({
  userName: z.string().min(1, "Tên đăng nhập không được để trống"),
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  fullName: z
    .string()
    .min(1, "Họ tên không được để trống")
    .max(32, "Họ tên không được quá 32 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Họ tên không được chứa ký tự đặc biệt hoặc số"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  phoneNumber: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(/^\d{10}$/, "Số điện thoại phải là 10 chữ số"),
  roles: z.array(z.string()).min(1, "Phải chọn ít nhất một vai trò"),
});

// POST /api/Users - Create response
const CreateUserResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
    userName: z.string(),
    email: z.string(),
  }),
  meta: z.string().nullable().optional(),
});

// PUT /api/Users/{id} - Update request body
const UpdateUserSchema = z.object({
  fullName: z
    .string()
    .min(1, "Họ tên không được để trống")
    .max(32, "Họ tên không được quá 32 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Họ tên không được chứa ký tự đặc biệt hoặc số"),
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Số điện thoại phải là 10 chữ số"),
});

// PUT /api/Users/{id} - Update response
const UpdateUserResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
    userName: z.string(),
  }),
  meta: z.string().nullable().optional(),
});

// GET /api/Users/roles - Roles list response
const RoleListResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(z.string()),
  meta: z.string().nullable().optional(),
});

// POST /api/Users/{id}/lock - Lock user request
const LockUserSchema = z.object({
  lockUntil: z.string(), // ISO datetime string
});

// POST /api/Users/{id}/lock - Lock user response
const LockUserResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
    isLockedOut: z.boolean(),
  }),
  meta: z.string().nullable().optional(),
});

// POST /api/Users/{id}/unlock - Unlock user response
const UnlockUserResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
    isLockedOut: z.boolean(),
  }),
  meta: z.string().nullable().optional(),
});

// POST /api/Users/{id}/roles - Assign roles request
const AssignRolesSchema = z.object({
  roles: z.array(z.string()).min(1, "Phải chọn ít nhất một vai trò"),
});

// POST /api/Users/{id}/roles - Assign roles response
const AssignRolesResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
    currentRoles: z.array(z.string()),
  }),
  meta: z.string().nullable().optional(),
});

// DELETE /api/Users/{id}/roles - Remove roles request
const RemoveRolesSchema = z.object({
  roles: z.array(z.string()).min(1, "Phải chọn ít nhất một vai trò"),
});

// DELETE /api/Users/{id}/roles - Remove roles response
const RemoveRolesResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
    currentRoles: z.array(z.string()),
  }),
  meta: z.string().nullable().optional(),
});

// POST /api/Users/{id}/change-password - Change password request
const ChangePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu không được quá 100 ký tự"),
});

// POST /api/Users/{id}/change-password - Change password response
const ChangePasswordResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
  }),
  meta: z.string().nullable().optional(),
});

export const UserSchema = {
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
};
