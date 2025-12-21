import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, redirect } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
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
import { AuthSchema } from "~/services/api/auth/auth.schema";
import type { Route } from "./+types/forgot-password";
import { useAuthHooks } from "./container/auth.hooks";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { UserRole } from "~/lib/auth/roles";
import { DASHBOARD } from "~/lib/fe-url";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quên Mật Khẩu - NOVA Hotel Management" },
    { name: "description", content: "Khôi phục mật khẩu tài khoản" },
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
export default function ForgotPassword() {
  const { forgotPassword, isLoading } = useAuthHooks();

  const { ForgotPasswordSchema } = AuthSchema;
  const forgotPasswordForm = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
  });
  const onSubmit: SubmitHandler<{ email: string }> = async ({
    email,
  }: {
    email: string;
  }) => {
    try {
      await forgotPassword(email);
    } catch (error) {
      console.error(error);
    }
    return false;
  };
  return (
    <Card className="w-124 pb-0 max-w-md shadow-none border-none bg-background">
      <CardHeader>
        <CardTitle>Thay đổi mật khẩu</CardTitle>
        <CardDescription>
          <Alert variant="default">
            <CircleAlert />
            <AlertTitle>Lưu ý!</AlertTitle>
            <AlertDescription>
              Gửi yêu cầu thay đổi mật khẩu bằng mã quản lý
            </AlertDescription>
          </Alert>
        </CardDescription>
      </CardHeader>
      <Form {...forgotPasswordForm}>
        <form
          onSubmit={forgotPasswordForm.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <CardContent>
            <div className="flex flex-col">
              <div className="grid gap-2">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email quản lý</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="nova-admin"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Vui lòng nhập mã quản lý để nhận email thay đổi mật
                        khẩu.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              size={"lg"}
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
            </Button>
            <div className="w-full flex justify-end">
              <Button asChild variant="ghost" size={"sm"}>
                <Link to="/auth/login" className="hover:underline ">
                  <ArrowLeft />
                  Quay lại đăng nhập
                </Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
