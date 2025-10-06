import { ArrowLeft, CircleAlert } from "lucide-react";
import { Link } from "react-router";
import SectionLayout from "~/components/layouts/sections";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
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

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <Card className="w-124 pb-0 max-w-md shadow-none border-none">
      <CardHeader>
        <CardTitle>Thay đổi mật khẩu</CardTitle>
        <CardDescription>
          <Alert variant="default">
            <CircleAlert />
            <AlertTitle>Lưu ý!</AlertTitle>
            <AlertDescription>
              Giới hạn gửi yêu cầu thay đổi mật khẩu là 5 lần
            </AlertDescription>
          </Alert>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col">
            <div className="grid gap-2">
              <Input id="email" type="text" placeholder="Mã quản lý" required />
              <div className="text-sm text-muted-foreground">
                Gửi yêu cầu thay đổi mật khẩu bằng mã quản lý
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button asChild size={"lg"} type="submit" className="w-full">
          <Link to="/auth/verify-otp">Gửi yêu cầu</Link>
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
    </Card>
  );
}
