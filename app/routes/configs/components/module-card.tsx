import { Box, Cuboid, Layers } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator"; // Dùng separator để tạo nhịp điệu
import { cn } from "~/lib/utils";
import type { GroupedConfigListItem } from "~/services/api/configs/dto";
import GroupSection from "./group-section";

interface ModuleCardProps {
  module: GroupedConfigListItem;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  // 1. Logic tính toán (Giữ nguyên tính chính xác)
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

  // Logic màu sắc:
  // - Ít thay đổi (< 10%): Màu muted (không gây chú ý)
  // - Thay đổi vừa phải: Màu Primary
  // - Thay đổi nhiều (> 50%): Màu Amber/Warning (Cảnh báo hệ thống bị can thiệp nhiều)
  const isHeavilyModified = percentage > 50;
  const isModified = customizedItems > 0;

  return (
    <div className="flex flex-col gap-5 py-4 first:pt-0">
      {/* === HEADER SECTION (Minimal) === */}
      <div className="flex flex-col gap-3 px-1">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Identification */}
          <div className="flex items-center gap-3">
            {/* Icon: Clean, no background, slightly muted until hovered */}
            <div className="text-muted-foreground transition-colors group-hover:text-primary">
              <Cuboid strokeWidth={1.5} className="h-5 w-5" />
            </div>

            <div className="flex flex-col">
              <h2 className="text-base font-semibold tracking-tight text-foreground leading-none">
                {module.moduleDisplayName}
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground/60 mt-1 uppercase tracking-wider">
                {module.module}
              </span>
            </div>
          </div>

          {/* Right: Data Visualization (Health Check) */}
          <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
            <div className="flex items-baseline gap-2 text-xs">
              <span
                className={cn(
                  "font-mono font-medium",
                  isModified ? "text-foreground" : "text-muted-foreground/50"
                )}
              >
                {customizedItems}/{totalItems}
              </span>
              <span className="text-muted-foreground/40 text-[10px]">
                customized
              </span>
            </div>

            {/* Micro-interaction: Progress Line */}
            {/* Design tip: Make it thin (h-1) for elegance. */}
            <Progress
              value={percentage}
              className={cn(
                "transition-all duration-500 h-1 w-32 bg-secondary",
                isHeavilyModified ? "bg-amber-500" : "bg-primary"
              )}
            />
          </div>
        </div>
      </div>

      {/* === CONTENT GRID === */}
      {/* Sử dụng grid để layout chặt chẽ hơn trên màn hình lớn */}
      <div className="grid gap-3 pl-1 md:pl-8">
        {/* Padding-left (md:pl-8) giúp content thụt vào thẳng hàng với Text của Header, tạo flow mắt nhìn tự nhiên */}
        {module.groups.map((group) => (
          <GroupSection
            key={group.group}
            group={group}
            moduleKey={module.module}
          />
        ))}
      </div>

      {/* Visual Separator: Chỉ hiện nếu không phải là phần tử cuối cùng (xử lý ở parent hoặc để mặc định mờ nhạt) */}
      <Separator className="mt-2 bg-border/40" />
    </div>
  );
}
