import { zodResolver } from "@hookform/resolvers/zod";
import { CloudAlert } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router";
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
import { Divider } from "~/components/ui/divider";
import { Input } from "~/components/ui/input";
import useAuthSchema from "~/schema/auth.schema";
import type { LoginDto } from "~/services/auth-service/dto";
import { useAuth } from "./container/auth.hooks";

export default function Login() {
  const { login, isLoading, error: apiError } = useAuth();
  const { LoginSchema } = useAuthSchema();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });
  const onSubmit: SubmitHandler<LoginDto> = async (data) => {
    try {
      await login(data);
    } catch (error) {
      console.error(error);
    }
    return false;
  };
  return (
    <Card className="w-124 pb-0 max-w-md shadow-none border-none">
      <CardHeader className="text-center">
        <CardTitle className="font-bold text-3xl">
          Chào mừng trở lại với NOVA
        </CardTitle>
        <CardDescription>
          Quản lý hệ thống Eco Palm dễ dàng và hiệu quả
        </CardDescription>
        {apiError && (
          <Alert variant="destructive">
            <CloudAlert />
            <AlertTitle className="text-start">Có lỗi xảy ra</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Input
                id="managerId"
                type="text"
                placeholder="Mã quản lý"
                {...register("userNameOrEmail")}
              />
              {errors.userNameOrEmail && (
                <span className="text-sm text-destructive">
                  {errors.userNameOrEmail.message}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Input
                id="password"
                type="password"
                placeholder="Mật khẩu"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-sm text-destructive">
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <Divider className="px-6 py-2">hoặc</Divider>
          <Button type="button" className="w-full" variant={"secondary"}>
            Đăng nhập với SMS
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
    </Card>
  );
}
