import { data, Link, useFetcher } from "react-router";
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
import type { Route } from "./+types/login";
export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const managerId = String(formData.get("managerId"));
  const password = String(formData.get("password"));

  const errors: any = {};
  if (!managerId.match(/^[a-zA-Z]{3,20}$/)) {
    errors.managerId = "Mã ID quản lý không hợp lệ";
  }

  if (password.length < 12) {
    errors.password = "Mật khẩu phải có ít nhất 12 ký tự";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }
  return data({ success: true });
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  let fetcher = useFetcher();
  let errors = fetcher.data?.errors;

  return (
    <Card className="w-124 pb-0 max-w-md shadow-none border-none">
      <CardHeader className="text-center">
        <CardTitle className="font-bold text-3xl">
          Chào mừng trở lại với NOVA
        </CardTitle>
        <CardDescription>
          Quản lý hệ thống Eco Palm dễ dàng và hiệu quả
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fetcher.Form id="login-form" method="post">
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Input
                id="managerId"
                name="managerId"
                type="text"
                placeholder="Mã quản lý"
                required
              />
              {errors?.managerId && (
                <span className="text-sm text-destructive">
                  {errors.managerId}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mật khẩu"
                required
              />

              {errors?.password && (
                <span className="text-sm text-destructive">
                  {errors.password}
                </span>
              )}
            </div>
          </div>
        </fetcher.Form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" form="login-form">
          Đăng nhập
        </Button>
        <Divider className="px-6 py-2">hoặc</Divider>
        <Button className="w-full" variant={"secondary"}>
          Đăng nhập với SMS
        </Button>
        <div className="flex justify-center items-center pt-2">
          <Link
            to="/auth/forgot-password"
            className="text-muted-foreground underline-offset-4 hover:underline hover:text-primary "
          >
            Quên mật khẩu?
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
