import { cn } from "~/lib/utils";

function Divider({
  children,
  className,
  weight = "thick",
  orientation = "horizontal",
}: {
  children?: React.ReactNode;
  className?: string;
  weight?: "thin" | "thick";
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div className={cn(`justify-center w-full flex items-center`, className)}>
      {orientation === "vertical" && (
        <div
          className={cn("h-full border-l-2", {
            "border-gray-200": weight === "thin",
            "border-gray-400": weight === "thick",
          })}
        />
      )}
      <div
        className={cn("border-b-2 w-full", {
          "border-gray-200": weight === "thin",
          "border-gray-400": weight === "thick",
          hidden: orientation === "vertical",
        })}
      />
      {children && (
        <span className="px-2.5 text-muted-foreground">{children}</span>
      )}
      <div
        className={cn("border-b-2 w-full", {
          "border-gray-200": weight === "thin",
          "border-gray-400": weight === "thick",
          hidden: orientation === "vertical",
        })}
      />
    </div>
  );
}

export { Divider };
