import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import SectionLayout from "~/components/layouts/sections";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Route } from "./+types/forgot-password";

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
    <SectionLayout center>
      <Card className="w-96 ">
        <CardHeader>
          <CardTitle>Forgot your account?</CardTitle>
          <CardAction>
            <Button asChild variant="ghost" size={"sm"}>
              <Link to="/auth/login" className="hover:underline">
                <ArrowLeft />
                Return
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <div className="text-sm text-muted-foreground">
                  Enter your email and we will send you a link to reset your
                  password.
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button asChild size={"lg"} type="submit" className="w-full">
            <Link to="/auth/verify-otp">Send</Link>
          </Button>
        </CardFooter>
      </Card>
    </SectionLayout>
  );
}
