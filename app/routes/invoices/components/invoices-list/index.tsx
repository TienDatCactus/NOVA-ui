import { FileText } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { InvoiceListItemDto } from "~/services/api/invoices/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface InvoicesDataTableProps {
  invoices: InvoiceListItemDto[];
  isLoading?: boolean;
}

function InvoicesDataTable({ invoices, isLoading }: InvoicesDataTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(10)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>Không tìm thấy hóa đơn</EmptyTitle>
          <EmptyDescription>
            Không có hóa đơn nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh
            bộ lọc hoặc tìm kiếm khác.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {/* You can add action buttons here if needed */}
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={invoices} />
    </div>
  );
}

export default InvoicesDataTable;
