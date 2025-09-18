import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUp,
} from "@clerk/clerk-react";
import React from "react";
import SectionLayout from "~/components/layouts/sections";
import { LoaderCircle } from "lucide-react";
import { ROUTES } from "~/lib/definitions";
const register: React.FC = () => {
  return (
    <SectionLayout>
      <ClerkLoading>
        <LoaderCircle className="animate-spin" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp signInUrl={ROUTES.AUTH.LOGIN} />
      </ClerkLoaded>
    </SectionLayout>
  );
};

export default register;
