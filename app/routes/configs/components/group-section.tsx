import { ChevronRight, FolderOpen, Layers } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { cn } from "~/lib/utils";
import ConfigItemRow from "./config-item-row";
import type z from "zod";
import type { ConfigSchema } from "~/services/api/configs/configs.schema";

interface GroupSectionProps {
  group: z.infer<typeof ConfigSchema.ConfigGroupSchema>;
  moduleKey: string;
  defaultOpen?: boolean;
}

export default function GroupSection({
  group,
  moduleKey,
  defaultOpen = false,
}: GroupSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const totalItems = group.items.length;
  const customizedCount = group.items.filter(
    (item) => item.isUsingCustomValue
  ).length;

  const isModified = customizedCount > 0;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "group/section transition-all duration-300 ease-in-out",
        isOpen
          ? "rounded-lg border border-border bg-card/50 my-2 shadow-sm"
          : "border border-transparent hover:bg-muted/30 rounded-lg"
      )}
    >
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between px-3 py-2.5 text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
          {/* === LEFT: Identifier === */}
          <div className="flex items-center gap-3">
            {/* Icon: Minimal, đổi màu khi Active */}
            <div
              className={cn(
                "transition-colors duration-200",
                isOpen
                  ? "text-primary"
                  : "text-muted-foreground/60 group-hover/section:text-foreground"
              )}
            >
              {isOpen ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <Layers className="h-4 w-4" />
              )}
            </div>

            <div className="flex flex-col">
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isOpen ? "text-foreground" : "text-foreground/80"
                )}
              >
                {group.groupDisplayName}
              </span>
            </div>
          </div>

          {/* === RIGHT: Meta & Actions === */}
          <div className="flex items-center gap-3">
            {(isModified || isOpen) && (
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium border transition-all",
                  isModified
                    ? "border-primary/20 bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary" // Primary look
                    : "border-border text-muted-foreground bg-transparent" // Neutral look
                )}
              >
                <span>
                  {customizedCount}/{totalItems}
                </span>
                {isModified && (
                  <span className="hidden sm:inline">đã chỉnh sửa</span>
                )}
              </div>
            )}

            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground/50 transition-transform duration-200",
                isOpen && "rotate-90 text-foreground"
              )}
            />
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="animate-collapsible-down overflow-hidden">
        {/* Nội dung bên trong: Có padding nhỏ để không dính sát lề */}
        <div className="pb-1">
          {/* Đường kẻ phân cách mờ */}
          {isOpen && <div className="mx-3 h-px bg-border/50 mb-1" />}

          <div className="flex flex-col">
            {group.items.map((item) => (
              <ConfigItemRow key={item.key} config={item} />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
