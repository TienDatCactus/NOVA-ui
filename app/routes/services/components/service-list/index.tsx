import { Utensils } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { ServiceItem } from "~/services/api/services/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface ServicesDataTableProps {
  services: ServiceItem[];
  isLoading?: boolean;
}

function ServicesDataTable({ services, isLoading }: ServicesDataTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Utensils />
          </EmptyMedia>
          <EmptyTitle>Chưa có dịch vụ</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có dịch vụ nào trong hệ thống. Hãy bắt đầu bằng cách thêm
            dịch vụ đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return <DataTable columns={columns} data={services} />;
}

export default ServicesDataTable;
