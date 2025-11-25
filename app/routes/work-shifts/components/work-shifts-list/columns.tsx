import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import type { WorkShiftListItem } from "~/services/api/staff/work-shift/dto";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/table/table-header";
import ActionsMenuCell from "../../fragments/actions.cell";

export const columns: ColumnDef<WorkShiftListItem>[] = [
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
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã ca" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{row.getValue("code")}</span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên ca làm việc" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giờ bắt đầu" />
    ),
    cell: ({ row }) => {
      const time = row.getValue("startTime") as string;
      const displayTime = time ? time.substring(0, 5) : "";
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">{displayTime}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "endTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giờ kết thúc" />
    ),
    cell: ({ row }) => {
      const time = row.getValue("endTime") as string;
      const displayTime = time ? time.substring(0, 5) : "";
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">{displayTime}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Trạng thái"
        className="text-center"
      />
    ),
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;
      return (
        <Badge variant={active ? "success" : "secondary"}>
          {active ? "Hoạt động" : "Ngừng hoạt động"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Thao tác</div>,
    cell: ({ row, table }) => {
      const workShift = row.original;
      const onSuccess = (table.options.meta as any)?.onSuccess;

      return (
        <div className="flex justify-center">
          <ActionsMenuCell workShift={workShift} onSuccess={onSuccess} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
