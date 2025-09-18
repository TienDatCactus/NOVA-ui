import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/clerk-react";
import React from "react";
import SectionLayout from "~/components/layouts/sections";
import { LoaderCircle } from "lucide-react";
import { ROUTES } from "~/lib/definitions";
const login: React.FC = () => {
  return (
    <SectionLayout>
      <ClerkLoading>
        <LoaderCircle className="animate-spin" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn signUpUrl={ROUTES.AUTH.REGISTER} />
      </ClerkLoaded>
    </SectionLayout>
  );
};

export default login;
