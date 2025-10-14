import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import useAuthSchema from "~/schema/auth.schema";
import type { ResetPasswordDto } from "~/services/auth-service/dto";
import { useAuth } from "./container/auth.hooks";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { Route } from "./+types/reset-password";
import SectionLayout from "~/components/layouts/sections";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function VerifyOTP({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { resetPassword, isLoading, error: apiError } = useAuth();
  const { ResetPasswordSchema } = useAuthSchema();
  const resetPasswordForm = useForm({
    resolver: zodResolver(ResetPasswordSchema),
  });
  const onSubmit: SubmitHandler<ResetPasswordDto> = async (data) => {
    try {
      await resetPassword(data);
    } catch (error) {
      console.error(error);
    }
    return false;
  };
  return (
    <SectionLayout center>
      <Card className="w-124 pb-0 max-w-md shadow-none border-none">
        <CardHeader className="text-center">
          <CardTitle>Thay đổi mật khẩu</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Nhập mã OTP đã gửi đến email của bạn.
          </CardDescription>
        </CardHeader>
        <Form {...resetPasswordForm}>
          <form
            onSubmit={resetPasswordForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <CardContent>
              <div className="flex flex-col  gap-6">
                <div className="grid gap-2">
                  <FormField
                    control={resetPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã quản lý</FormLabel>
                        <FormControl>
                          <Input placeholder="nova-admin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={resetPasswordForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã OTP</FormLabel>
                        <FormControl>
                          <InputOTP
                            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                            maxLength={6}
                            className="w-full"
                            {...field}
                          >
                            <InputOTPGroup className="*:w-16 *:h-14">
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormDescription>
                          Vui lòng nhập mã OTP đã gửi đến email của bạn.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={resetPasswordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input placeholder="nova-new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={resetPasswordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="confirm-new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
              <Button size={"lg"} className="w-full" type="submit">
                Gửi
              </Button>
              <Button
                asChild
                variant={"outline"}
                size={"lg"}
                type="reset"
                className="w-full"
              >
                <Link to="/auth/login">Hủy</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </SectionLayout>
  );
}
