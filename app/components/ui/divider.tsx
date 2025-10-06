import { cn } from "~/lib/utils";

function Divider({
  children,
  className,
  weight = "thick",
}: {
  children?: React.ReactNode;
  className?: string;
  weight?: "thin" | "thick";
}) {
  return (
    <div className={cn(`justify-center w-full flex items-center`, className)}>
      <div
        className={cn("border-b-2 w-full", {
          "border-gray-200": weight === "thin",
          "border-gray-400": weight === "thick",
        })}
      />
      {children && (
        <span className="px-2.5 text-muted-foreground">{children}</span>
      )}
      <div
        className={cn("border-b-2 w-full", {
          "border-gray-200": weight === "thin",
          "border-gray-400": weight === "thick",
        })}
      />
    </div>
  );
}

export { Divider };
