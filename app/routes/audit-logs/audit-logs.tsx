import { useDebounceValue } from "usehooks-ts";
import AuditLogsDataTable from "./components/audit-logs-list";
import { useAuditFilters } from "./container/filter.hooks";
import { useAuditLogs } from "./container/query.hooks";
import AuditLogsLayout from "./layouts/audit-logs.layouts";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { RouteModule, Permission } from "~/lib/auth/roles";
import type { Route } from "./+types/audit-logs";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nhật Ký Hoạt Động - NOVA Hotel Management" },
    { name: "description", content: "Theo dõi nhật ký hoạt động hệ thống" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.AuditLogs, Permission.Read);

export default function AuditLogs() {
  const { filters, resetFilters, updateFilter } = useAuditFilters();
  const [debouncedKeyword] = useDebounceValue(filters.Keyword || "", 500);
  const { data: logsData, isPending: isLogsLoading } = useAuditLogs({
    ...filters,
    Keyword: debouncedKeyword,
  });
  return (
    <AuditLogsLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalItems={logsData?.totalCount || 0}
      totalPages={logsData?.totalPages || 0}
      currentPage={logsData?.page || filters.Page || 1}
    >
      <AuditLogsDataTable
        audits={
          logsData || {
            items: [],
            totalCount: 0,
            page: 1,
            pageSize: 20,
            totalPages: 0,
          }
        }
        isLoading={isLogsLoading}
      />
    </AuditLogsLayout>
  );
}
