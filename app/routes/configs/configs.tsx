import { Search, SlidersHorizontal, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import ModuleCard from "./components/module-card";
import { useGroupedConfigs } from "./container/query.hooks";
import ConfigsLayout from "./layouts/configs.layout";

export default function ConfigsPage() {
  const { data: configData, isPending } = useGroupedConfigs();

  return (
    <ConfigsLayout>
      <div className="flex flex-col">
        {/* === CONTENT SECTION === */}
        <div className="min-h-[400px]">
          {isPending ? (
            <ConfigsSkeleton />
          ) : configData?.length === 0 ? (
            <div className="py-12">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Không có kết quả</EmptyTitle>
                  <EmptyDescription>
                    Thử điều chỉnh tìm kiếm hoặc bộ lọc để tìm những gì bạn đang
                    tìm kiếm .
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className=" animate-in slide-in-from-bottom-2 duration-500">
              {configData?.map((module: any) => (
                <ModuleCard key={module.module} module={module} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ConfigsLayout>
  );
}

// === INTERNAL COMPONENT: SKELETON ===
// Tailored to look exactly like the ModuleCard -> GroupSection structure
function ConfigsSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-5 py-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-md" /> {/* Icon */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" /> {/* Title */}
                <Skeleton className="h-3 w-20" /> {/* Subtitle */}
              </div>
            </div>
            <Skeleton className="h-2 w-32" /> {/* Progress Bar */}
          </div>

          {/* Groups Skeleton */}
          <div className="grid gap-3 pl-1 md:pl-8">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
