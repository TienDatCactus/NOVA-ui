import React from "react";
import { cn } from "~/lib/utils";
const SectionLayout = ({
  children,
  className,
  center = false,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}) => {
  return (
    <section className="relative h-screen ">
      <main
        className={cn(`w-full h-full z-10  ${className}`, {
          "flex flex-col mx-auto items-center justify-center": center == true,
        })}
      >
        {children}
      </main>
    </section>
  );
};

export default SectionLayout;
