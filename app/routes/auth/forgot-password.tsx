import { ArrowLeft, CircleAlert } from "lucide-react";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Route } from "./+types/forgot-password";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useAuth } from "./container/auth.hooks";
import { useForm, type SubmitHandler } from "react-hook-form";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function ForgotPassword() {
  const { forgotPassword, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    email: string;
  }>();
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
    <Card className="w-124 pb-0 max-w-md shadow-none border-none">
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CardContent>
          <div className="flex flex-col">
            <div className="grid gap-2">
              <Input
                id="email"
                type="text"
                disabled={isLoading}
                placeholder="Mã quản lý"
                {...register("email", {
                  required: true,
                  validate: (value) => value.trim() !== "",
                })}
              />
              {errors.email && (
                <span className="text-sm text-destructive">
                  {errors.email.message}
                </span>
              )}
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
    </Card>
  );
}
