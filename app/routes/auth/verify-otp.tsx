import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Link } from "react-router";
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
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import type { Route } from "./+types/verify-otp";

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
      <Card className="w-96 max-w-md ">
        <CardHeader className="text-center">
          <CardTitle>Verify with a One-Time-Password</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter the OTP sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col justify-center items-center gap-6">
              <div className="grid gap-2">
                <InputOTP pattern={REGEXP_ONLY_DIGITS_AND_CHARS} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2">
          <Button size={"lg"} className="w-full" type="submit">
            Send
          </Button>
          <Button asChild variant={"outline"} size={"lg"} className="w-full">
            <Link to="/auth/login">Cancel</Link>
          </Button>
        </CardFooter>
      </Card>
    </SectionLayout>
  );
}
