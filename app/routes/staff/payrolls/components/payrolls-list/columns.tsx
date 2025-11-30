import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/table/table-header";
import ActionsMenuCell from "../../fragments/actions.cell";
import StatusSelectCell from "../../fragments/status-select.cell";
import { Button } from "~/components/ui/button";
import PayrollDetailDialog from "../payroll-detail-dialog";
import { useState } from "react";

export const columns: ColumnDef<PayrollItemDto>[] = [
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "staffCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã nhân viên" />
    ),
    cell: ({ row }) => {
      const [openDetailDialog, setOpenDetailDialog] = useState(false);
      return (
        <>
          <Button
            variant="link"
            className="p-0"
            onClick={() => setOpenDetailDialog(true)}
          >
            {row.getValue("staffCode")}
          </Button>
          <PayrollDetailDialog
            payrollId={row.original.payrollId}
            onOpenChange={setOpenDetailDialog}
            open={openDetailDialog}
          />
        </>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "staffName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên nhân viên" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("staffName")}</span>
      </div>
    ),
    enableHiding: false,
    filterFn: (row, id, value) => {
      const staffName = row.getValue(id) as string;
      const staffCode = row.getValue("staffCode") as string;
      const searchValue = value.toLowerCase();
      return (
        staffName.toLowerCase().includes(searchValue) ||
        staffCode.toLowerCase().includes(searchValue)
      );
    },
  },
  {
    accessorKey: "assignedDays",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày công định mức" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày công thực tế" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phép có lương" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phép không lương" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lương cơ bản (tháng đủ)" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Lương cơ bản tính theo công"
      />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phụ cấp/Khấu trừ" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng thu nhập kỳ này" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đã thanh toán" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Còn phải trả" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Còn ngày dư chưa xử lý" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
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
    accessorKey: "hasExpense",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phiếu chi" />
    ),
    cell: ({ row }) => {
      const hasExpense = row.original.hasExpense;

      if (hasExpense) {
        return (
          <div className="flex justify-center">
            <Badge variant="default" className="text-xs bg-green-600">
              Đã tạo
            </Badge>
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Chưa tạo
          </Badge>
        </div>
      );
    },
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
