import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CircleAlert } from "lucide-react";
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
import useAuthSchema from "~/schema/auth.schema";
import type { Route } from "./+types/forgot-password";
import { useAuth } from "./container/auth.hooks";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function ForgotPassword() {
  const { forgotPassword, isLoading } = useAuth();
  const { ForgotPasswordSchema } = useAuthSchema();
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
                      <FormLabel>Mã quản lý</FormLabel>
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
