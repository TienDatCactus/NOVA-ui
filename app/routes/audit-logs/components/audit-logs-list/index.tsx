import type { AuditListResponse } from "~/services/api/audit/dto";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Skeleton } from "~/components/ui/skeleton";

interface AuditLogsDataTableProps {
  audits: AuditListResponse;
  isLoading?: boolean;
}

function AuditLogsDataTable({ audits, isLoading }: AuditLogsDataTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
      </div>
    );
  }
  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={audits.items} />
    </div>
  );
}

export default AuditLogsDataTable;
