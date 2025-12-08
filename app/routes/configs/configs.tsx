import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import {
  AuthLoader,
  hasAnyRole,
  Permission,
  RouteModule,
  UserRole,
} from "~/lib/auth/auth.loader";
import ModuleCard from "./components/module-card";
import { useGroupedConfigs } from "./container/query.hooks";
import ConfigsLayout from "./layouts/configs.layout";
import { useMemo } from "react";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Configs, Permission.Read);

export default function ConfigsPage() {
  const { data, isPending } = useGroupedConfigs();
  const configData = useMemo(() => {
    if (hasAnyRole(AuthLoader.getUser(), [UserRole.Admin])) {
      return data?.filter(
        (item) => item.module == "System" || item.module == "AuditLog"
      );
    } else {
      return data?.filter(
        (item) => item.module !== "System" && item.module !== "AuditLog"
      );
    }
  }, [data]);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
