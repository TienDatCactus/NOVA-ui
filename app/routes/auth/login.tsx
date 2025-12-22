import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, redirect } from "react-router";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import PasswordInput from "~/components/ui/password-input";
import { Checkbox } from "~/components/ui/checkbox";
import { useAccountManager } from "~/store/account-manager.store";
import { AuthSchema } from "~/services/api/auth/auth.schema";
import type { LoginDto } from "~/services/api/auth/dto";
import type { Route } from "./+types/login";
import { useAuthHooks } from "./container/auth.hooks";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { UserRole } from "~/lib/auth/roles";
import { DASHBOARD } from "~/lib/fe-url";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đăng Nhập - NOVA Hotel Management" },
    { name: "description", content: "Đăng nhập hệ thống quản lý khách sạn" },
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
export default function Login() {
  const { login, isLoading } = useAuthHooks();
  const { LoginSchema } = AuthSchema;
  const { addAccount } = useAccountManager();
  const [rememberAccount, setRememberAccount] = useState(true);

  const loginForm = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit: SubmitHandler<LoginDto> = async (data) => {
    try {
      const response = await login(data);

      // Save account if remember is checked
      if (rememberAccount && response?.user) {
        addAccount({
          id: response.user.id,
          userName: response.user.userName,
          fullName: response.user.fullName,
          roles: response.user.roles,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Card className="w-124 max-w-md bg-transparent border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="font-bold text-3xl">
          Chào mừng trở lại với NOVA
        </CardTitle>
        <CardDescription>
          Quản lý hệ thống Eco Palm dễ dàng và hiệu quả
        </CardDescription>
      </CardHeader>
      <Form {...loginForm}>
        <form className="space-y-4" onSubmit={loginForm.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <FormField
                  control={loginForm.control}
                  name="userNameOrEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã quản lý</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoFocus
                          type="text"
                          placeholder="nova-admin"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          type="password"
                          placeholder="nova-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Remember Account Checkbox */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="remember-account"
                checked={rememberAccount}
                onCheckedChange={(checked) =>
                  setRememberAccount(checked as boolean)
                }
              />
              <label
                htmlFor="remember-account"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Ghi nhớ tài khoản này
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <div className="flex justify-center items-center pt-2">
              <Link
                to="/auth/forgot-password"
                className="text-muted-foreground underline-offset-4 hover:underline hover:text-primary"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
