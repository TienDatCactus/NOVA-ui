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
    <section className="relative bg-[#f8fafc] h-screen">
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      <main
        className={cn(`relative h-full z-10 container ${className}`, {
          "flex flex-col mx-auto items-center justify-center": center == true,
        })}
      >
        {children}
      </main>
    </section>
  );
};

export default SectionLayout;
