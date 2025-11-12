import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import type { HolidayListItem } from "~/services/api/holiday/dto";
import { Checkbox } from "~/components/ui/checkbox";
import ActionsMenuCell from "../../fragments/actions.cell";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export const columns: ColumnDef<HolidayListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn dòng"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "name",
    header: "Tên ngày nghỉ",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Ngày bắt đầu",
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
    header: "Ngày kết thúc",
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
    accessorKey: "bonusAmount",
    header: "Tiền thưởng",
    cell: ({ row }) => {
      const amount = row.getValue("bonusAmount") as number;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">
            {amount.toLocaleString("vi-VN")} VNĐ
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "isPublicHoliday",
    header: () => <div className="text-center">Loại</div>,
    cell: ({ row }) => {
      const isPublic = row.getValue("isPublicHoliday") as boolean;
      return (
        <div className="flex justify-center">
          <Badge
            variant={isPublic ? "default" : "secondary"}
            className={
              isPublic
                ? "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                : "bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
            }
          >
            {isPublic ? "Lễ quốc gia" : "Lễ thường"}
          </Badge>
        </div>
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
  },
];
