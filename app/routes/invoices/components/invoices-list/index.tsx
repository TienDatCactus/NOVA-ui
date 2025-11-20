import type { InvoiceListItemDto } from "~/services/api/invoices/dto";
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
import { FileText } from "lucide-react";

interface InvoicesDataTableProps {
  invoices: InvoiceListItemDto[];
  isLoading?: boolean;
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

function InvoicesDataTable({
  invoices,
  isLoading,
  pageCount,
  currentPage,
  onPageChange,
}: InvoicesDataTableProps) {
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
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={invoices} />
    </div>
  );
}

export default InvoicesDataTable;
