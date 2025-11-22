import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import { Checkbox } from "~/components/ui/checkbox";
import ActionsMenuCell from "../../fragments/actions.cell";
import StatusSelectCell from "../../fragments/status-select.cell";

export const columns: ColumnDef<PayrollItemDto>[] = [
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
    enableHiding: false,
  },
  {
    accessorKey: "staffCode",
    header: "Mã nhân viên",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-mono font-medium">
          {row.getValue("staffCode")}
        </span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "staffName",
    header: "Tên nhân viên",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("staffName")}</span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "assignedDays",
    header: () => <div className="text-center">Ngày công định mức</div>,
    cell: ({ row }) => {
      const assignedDays = row.getValue("assignedDays") as number;
      return (
        <div className="flex flex-col items-center">
          <span className="font-mono font-medium">{assignedDays}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "workDays",
    header: () => <div className="text-center">Ngày công thực tế</div>,
    cell: ({ row }) => {
      const workDays = row.getValue("workDays") as number;
      return (
        <div className="flex flex-col items-center">
          <span className="font-mono font-medium">{workDays}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "paidLeaveDaysUsed",
    header: () => <div className="text-center">Phép có lương</div>,
    cell: ({ row }) => {
      const used = row.getValue("paidLeaveDaysUsed") as number;
      return (
        <div className="flex flex-col items-center">
          <span className="font-mono text-sm">{used}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "unpaidLeaveDays",
    header: () => <div className="text-center">Phép không lương</div>,
    cell: ({ row }) => {
      const unpaid = row.getValue("unpaidLeaveDays") as number;
      return (
        <div className="flex justify-center">
          <span className="font-mono text-sm">{unpaid}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "baseSalaryFullMonth",
    header: () => <div className="text-right">Lương cơ bản (tháng đủ)</div>,
    cell: ({ row }) => {
      const amount = row.getValue("baseSalaryFullMonth") as number;
      return (
        <div className="text-right">
          <span className="font-mono text-sm">
            {amount.toLocaleString("vi-VN")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "baseSalaryCalculated",
    header: () => <div className="text-right">Lương cơ bản tính theo công</div>,
    cell: ({ row }) => {
      const amount = row.getValue("baseSalaryCalculated") as number;
      return (
        <div className="text-right">
          <span className="font-mono text-sm">
            {amount.toLocaleString("vi-VN")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "componentsTotal",
    header: () => <div className="text-right">Phụ cấp/Khấu trừ</div>,
    cell: ({ row }) => {
      const amount = row.getValue("componentsTotal") as number;
      const isPositive = amount >= 0;
      return (
        <div className="text-right">
          <span
            className={`font-mono text-sm ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {amount >= 0 ? "+" : ""}
            {amount.toLocaleString("vi-VN")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="text-right">Tổng thu nhập kỳ này</div>,
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return (
        <div className="text-right">
          <span className="font-mono font-semibold text-base">
            {amount.toLocaleString("vi-VN")}
          </span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "paidAmount",
    header: () => <div className="text-right">Đã thanh toán</div>,
    cell: ({ row }) => {
      const paid = row.getValue("paidAmount") as number;
      return (
        <div className="text-right">
          <span className="font-mono text-sm">
            {paid.toLocaleString("vi-VN")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "remainingAmount",
    header: () => <div className="text-right">Còn phải trả</div>,
    cell: ({ row }) => {
      const remaining = row.getValue("remainingAmount") as number;
      return (
        <div className="text-right">
          <span
            className={`font-mono text-sm ${remaining > 0 ? "text-orange-600" : remaining < 0 ? "text-red-600" : "text-green-600"}`}
          >
            {remaining.toLocaleString("vi-VN")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "hasUnusedLeavePending",
    header: () => <div className="text-center">Còn ngày dư chưa xử lý</div>,
    cell: ({ row }) => {
      const hasUnusedLeavePending = row.getValue(
        "hasUnusedLeavePending"
      ) as boolean;

      if (!hasUnusedLeavePending) {
        return (
          <div className="flex justify-center">
            <Badge variant="outline" className="text-xs">
              Đã xử lý
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs">
            Chưa xử lý
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "locked",
    header: () => <div className="text-center">Trạng thái</div>,
    cell: ({ row, table }) => {
      const locked = row.getValue("locked") as boolean;
      const payroll = row.original;
      const onSuccess = (table.options.meta as any)?.onSuccess;

      return (
        <StatusSelectCell
          payrollId={payroll.payrollId}
          locked={locked}
          onSuccess={onSuccess}
        />
      );
    },
    enableHiding: false,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Thao tác</div>,
    cell: ({ row, table }) => {
      const payroll = row.original;
      const onSuccess = (table.options.meta as any)?.onSuccess;

      return (
        <div className="flex justify-center">
          <ActionsMenuCell payroll={payroll} onSuccess={onSuccess} />
        </div>
      );
    },
    enableHiding: false,
  },
];
