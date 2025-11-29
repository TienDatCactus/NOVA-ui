import AuditLogsDataTable from "./components/audit-logs-list";
import { useAuditFilters } from "./container/filter.hooks";
import { useAuditLogs } from "./container/query.hooks";
import AuditLogsLayout from "./layouts/audit-logs.layouts";

export default function AuditLogs() {
  const { filters, resetFilters, updateFilter } = useAuditFilters();
  const { data: logsData, isPending: isLogsLoading } = useAuditLogs({
    ...filters,
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
