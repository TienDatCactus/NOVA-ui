import type z from "zod";
import { AuthSchema } from "./auth.schema";
("~/services/api/auth/auth.schema");
const {
  LoginSchema,
  LoginResponseSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
} = AuthSchema;
export type LoginDto = z.infer<typeof LoginSchema>;
export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
