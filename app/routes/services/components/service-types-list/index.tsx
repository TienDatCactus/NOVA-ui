import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { FolderTree } from "lucide-react";
import { Button } from "~/components/ui/button";

type EnrichedServiceTypeItem = ServiceTypeItem & { serviceCount?: number };

interface ServiceTypesDataTableProps {
  types: EnrichedServiceTypeItem[];
  isLoading?: boolean;
}

function ServiceTypesDataTable({
  types,
  isLoading,
}: ServiceTypesDataTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
      </div>
    );
  }

  if (!types || types.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderTree />
          </EmptyMedia>
          <EmptyTitle>Chưa có loại dịch vụ</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có loại dịch vụ nào trong hệ thống. Hãy bắt đầu bằng cách
            thêm loại dịch vụ đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={types} />
    </div>
  );
}

export default ServiceTypesDataTable;
