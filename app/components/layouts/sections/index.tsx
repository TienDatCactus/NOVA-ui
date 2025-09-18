import React from "react";
const SectionLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="container h-screen flex flex-col max-w-6xl mx-auto items-center justify-center">
      {children}
    </section>
  );
};

export default SectionLayout;
