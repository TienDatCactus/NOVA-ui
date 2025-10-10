import type z from "zod";
import useAuthSchema from "~/schema/auth.schema";

const { LoginSchema, LoginResponseSchema, ResetPasswordSchema } =
  useAuthSchema();
type LoginDto = z.infer<typeof LoginSchema>;
type LoginResponseDto = z.infer<typeof LoginResponseSchema>;
type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type { LoginDto, LoginResponseDto, ResetPasswordDto };
