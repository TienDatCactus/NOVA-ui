import { Box, PackageCheck } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import type { GroupedConfigListItem } from "~/services/api/configs/dto";
import GroupSection from "./group-section";

interface ModuleCardProps {
  module: GroupedConfigListItem;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  // Logic calculations
  const totalItems = module.groups.reduce(
    (sum, group) => sum + group.items.length,
    0
  );
  const customizedItems = module.groups.reduce(
    (sum, group) =>
      sum + group.items.filter((item) => item.isUsingCustomValue).length,
    0
  );

  const percentage = totalItems > 0 ? (customizedItems / totalItems) * 100 : 0;
  const isModified = customizedItems > 0;

  return (
    <div className="group flex flex-col bg-card border rounded-xl shadow-sm transition-all hover:shadow-md py-4">
      {/* --- HEADER SECTION --- */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center border transition-colors",
                isModified
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted/50 border-muted text-muted-foreground"
              )}
            >
              <PackageCheck className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h2 className="font-semibold text-foreground tracking-tight">
                {module.moduleDisplayName}
              </h2>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider bg-muted/50 w-fit px-1.5 py-0.5 rounded-sm">
                {module.module}
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="flex flex-col items-end gap-2 min-w-[120px]">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "font-medium",
                  isModified ? "text-primary" : "text-muted-foreground"
                )}
              >
                {Math.round(percentage)}%
              </span>
              <span className="text-muted-foreground/60 text-[10px]">
                đã chỉnh sửa
              </span>
            </div>

            <Progress value={percentage} className="h-1.5 w-32" />

            <p className="text-[10px] text-muted-foreground/50 font-mono">
              {customizedItems} / {totalItems} configs
            </p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="border-l-2 border-muted/40 space-y-4">
          {module.groups.map((group) => (
            <GroupSection group={group} moduleKey={module.module} />
          ))}
        </div>
      </div>
    </div>
  );
}
