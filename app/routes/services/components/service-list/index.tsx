import type { ServiceItem } from "~/services/api/services/dto";
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
import { Utensils } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { ServiceDensity } from "~/services/types/service.types";

interface ServicesDataTableProps {
  services: ServiceItem[];
  isLoading?: boolean;
  density: ServiceDensity;
  onAddService: () => void;
  onSelectionChange?: (selectedRows: ServiceItem[]) => void;
  onEdit: (service: ServiceItem) => void;
  onDelete: (service: ServiceItem) => void;
}

function ServicesDataTable({
  services,
  isLoading,
  density,
  onAddService,
  onSelectionChange,
  onEdit,
  onDelete,
}: ServicesDataTableProps) {
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
        <EmptyContent>
          <Button onClick={onAddService}>Thêm dịch vụ đầu tiên</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={services}
      density={density}
      onSelectionChange={onSelectionChange}
    />
  );
}

export default ServicesDataTable;
