import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { Badge } from "~/components/ui/badge";
import type { HolidayListItem } from "~/services/api/holiday/dto";
import ActionsMenuCell from "../../fragments/actions.cell";

export const columns: ColumnDef<HolidayListItem>[] = [
  {
    accessorKey: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên ngày nghỉ" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày bắt đầu" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("startDate") as string;
      const formatted = format(parseISO(date), "dd/MM/yyyy", { locale: vi });
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">{formatted}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày kết thúc" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("endDate") as string;
      const formatted = format(parseISO(date), "dd/MM/yyyy", { locale: vi });
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">{formatted}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "isPublicHoliday",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => {
      const isPublic = row.getValue("isPublicHoliday") as boolean;
      return (
        <Badge variant={isPublic ? "success" : "secondary"}>
          {isPublic ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Thao tác</div>,
    cell: ({ row, table }) => {
      const holiday = row.original;
      const onSuccess = (table.options.meta as any)?.onSuccess;

      return (
        <div className="flex justify-center">
          <ActionsMenuCell holiday={holiday} onSuccess={onSuccess} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
