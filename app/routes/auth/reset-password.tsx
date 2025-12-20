import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, redirect, useLocation } from "react-router";
import { toast } from "sonner";
import SectionLayout from "~/components/layouts/sections";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import PasswordInput from "~/components/ui/password-input";
import { AuthSchema } from "~/services/api/auth/auth.schema";
import type { ResetPasswordDto } from "~/services/api/auth/dto";
import type { Route } from "./+types/reset-password";
import { useAuthHooks } from "./container/auth.hooks";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { UserRole } from "~/lib/auth/roles";
import { DASHBOARD } from "~/lib/fe-url";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đặt Lại Mật Khẩu - NOVA Hotel Management" },
    { name: "description", content: "Xác thực OTP và đặt lại mật khẩu mới" },
  ];
}
export function clientLoader({}: Route.ClientLoaderArgs) {
  const user = AuthLoader.getUser();
  if (user) {
    if (user.roles?.includes(UserRole.Admin)) {
      throw redirect(DASHBOARD.auditLogs);
    } else if (user.roles?.includes(UserRole.HotelManager)) {
      throw redirect(DASHBOARD.finances.dashboard);
    } else if (user.roles?.includes(UserRole.ServiceStaff)) {
      throw redirect(DASHBOARD.rooms.list);
    } else if (user.roles?.includes(UserRole.Accountant)) {
      throw redirect(DASHBOARD.expenses);
    } else if (user.roles?.includes(UserRole.Receptionist)) {
      throw redirect(DASHBOARD.bookings.list);
    } else {
      throw redirect(DASHBOARD.bookings.list);
    }
  }
}
export default function VerifyOTP({}: Route.ComponentProps) {
  const { resetPassword, isLoading } = useAuthHooks();
  const requestedEmail = useLocation().state.email as string;
  if (!requestedEmail) {
    toast.error(
      "Vui lòng yêu cầu đặt lại mật khẩu trước khi truy cập trang này."
    );
    return null;
  }
  const { ResetPasswordSchema } = AuthSchema;
  const resetPasswordForm = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { email: requestedEmail },
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
      <Card className="w-124 pb-0 max-w-md shadow-none bg-background border-none">
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
                        <FormLabel>Email quản lý</FormLabel>
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
                            <InputOTPGroup className="*:w-14 gap-2 *:h-12 *:border-2 *:border-input *:bg-transparent *:text-center *:text-2xl *:focus:border-primary *:focus:outline-none *:rounded-md *:shadow-sm *:transition-colors">
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
                          <PasswordInput
                            placeholder="nova-new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={resetPasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                        <FormControl>
                          <PasswordInput
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
              <Button
                disabled={isLoading}
                size={"lg"}
                className="w-full"
                type="submit"
              >
                {isLoading && <Loader2 className="animate-spin" />}
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
