import z from "zod";

const LoginSchema = z.object({
  userNameOrEmail: z.union([
    z.email("Email không hợp lệ"),
    z.string().min(2, "Mã quản lý phải có ít nhất 2 ký tự"),
  ]),
  password: z
    .string("Mật khẩu không hợp lệ")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const ResetPasswordSchema = z
  .object({
    email: z.email("Mã quản lý không hợp lệ"),
    code: z.string().min(1, "Mã xác nhận không được để trống"),
    newPassword: z
      .string("Mật khẩu mới không hợp lệ")
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmNewPassword: z
      .string("Mật khẩu xác nhận không hợp lệ")
      .min(6, "Xác nhận mật khẩu mới phải có ít nhất 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu mới và xác nhận mật khẩu mới không khớp",
  });

const ForgotPasswordSchema = z.object({
  email: z.string("Mã quản lý không hợp lệ"),
});

const LoginResponseSchema = z.object({
  accessToken: z.string(),
  expiresAtUtc: z.string(),
  tokenType: z.literal("Bearer"),
  user: z.object({
    id: z.string(),
    userName: z.string(),
    fullName: z.string().optional(),
    roles: z.array(z.string()).optional(),
  }),
});

const useAuthSchema = () => {
  return {
    LoginSchema,
    LoginResponseSchema,
    ResetPasswordSchema,
    ForgotPasswordSchema,
  };
};

export default useAuthSchema;
