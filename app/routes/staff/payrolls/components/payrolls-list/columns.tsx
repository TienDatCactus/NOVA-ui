import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { UserRole } from "~/lib/auth/roles";
import { cn, formatMoney } from "~/lib/utils";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import ActionsMenuCell from "../../fragments/actions.cell";
import PayrollDetailDialog from "../payroll-detail-dialog";

export const columns: ColumnDef<PayrollItemDto>[] = [
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground font-mono text-xs">
          {row.index + 1}
        </span>
      );
    },
    size: 50,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "staffCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã NV" />
    ),
    cell: ({ row }) => {
      const [openDetailDialog, setOpenDetailDialog] = useState(false);
      return (
        <>
          <Button
            variant="link"
            className="p-0 h-auto font-mono font-semibold text-primary"
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
      <DataTableColumnHeader column={column} title="Họ và tên" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col max-w-[180px]">
        <span
          className="font-medium truncate"
          title={row.getValue("staffName")}
        >
          {row.getValue("staffName")}
        </span>
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
  // --- Days Group ---
  {
    accessorKey: "assignedDays",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số ngày đi làm" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono text-muted-foreground">
        {row.getValue("assignedDays")}
      </div>
    ),
  },
  {
    accessorKey: "workDays",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thực tế" />
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono font-medium">
        {row.getValue("workDays")}
      </div>
    ),
  },
  {
    accessorKey: "paidLeaveDaysUsed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phép (L)" />
    ),
    cell: ({ row }) => {
      const val = row.getValue("paidLeaveDaysUsed") as number;
      return (
        <div
          className={cn(
            "text-center font-mono",
            val === 0 && "text-muted-foreground/50"
          )}
        >
          {val}
        </div>
      );
    },
  },
  {
    accessorKey: "unpaidLeaveDays",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nghỉ (KL)" />
    ),
    cell: ({ row }) => {
      const val = row.getValue("unpaidLeaveDays") as number;
      return (
        <div
          className={cn(
            "text-center font-mono",
            val > 0 ? "text-destructive" : "text-muted-foreground/50"
          )}
        >
          {val}
        </div>
      );
    },
  },
  // --- Salary & Money Group ---
  {
    accessorKey: "baseSalaryCalculated",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Lương theo công"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("baseSalaryCalculated") as number;
      return (
        <div className="text-right font-mono text-muted-foreground">
          {formatMoney(amount).vndFormatted}
        </div>
      );
    },
  },
  {
    accessorKey: "componentsTotal",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Phụ cấp/Trừ"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("componentsTotal") as number;
      return (
        <div
          className={cn(
            "text-right font-mono",
            amount < 0 ? "text-destructive" : "text-foreground",
            amount === 0 && "text-muted-foreground/50"
          )}
        >
          {amount > 0 ? "+" : ""}
          {formatMoney(amount).vndFormatted}
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Tổng thu nhập"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return (
        <div className="text-center font-mono font-bold text-primary">
          {formatMoney(amount).vndFormatted}
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "paidAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Đã thanh toán"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const paid = row.getValue("paidAmount") as number;
      return (
        <div
          className={cn(
            "text-right font-mono",
            paid === 0 && "text-muted-foreground/50"
          )}
        >
          {formatMoney(paid).vndFormatted}
        </div>
      );
    },
  },
  {
    accessorKey: "remainingAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Còn lại"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const remaining = row.getValue("remainingAmount") as number;

      // Logic:
      // > 0: Company owes Employee (Standard) -> Bold
      // < 0: Employee owes Company (Deduction needed) -> Destructive (Red)
      // = 0: Cleared -> Muted

      return (
        <div className="text-right">
          <span
            className={cn(
              "font-mono font-medium",
              remaining < 0 ? "text-destructive" : "text-foreground",
              remaining === 0 && "text-muted-foreground/50"
            )}
          >
            {formatMoney(remaining).vndFormatted}
          </span>
        </div>
      );
    },
  },
  // --- Status Group ---
  {
    accessorKey: "hasUnusedLeavePending",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày dư" />
    ),
    cell: ({ row }) => {
      const hasUnusedLeavePending = row.getValue(
        "hasUnusedLeavePending"
      ) as boolean;

      if (!hasUnusedLeavePending) return null;

      return (
        <div className="flex ">
          <Badge
            variant="destructive"
            className="h-6 w-6 p-0 flex items-center  rounded-full"
          >
            <span className="sr-only">Chưa xử lý</span>!
          </Badge>
        </div>
      );
    },
    size: 60,
  },

  {
    id: "actions",
    cell: ({ row, table }) => {
      const payroll = row.original;
      const onSuccess = (table.options.meta as any)?.onSuccess;
      if (hasAnyRole(AuthLoader.getUser(), [UserRole.Accountant]))
        return (
          <div className="flex ">
            <ActionsMenuCell payroll={payroll} onSuccess={onSuccess} />
          </div>
        );
      return null;
    },
    size: 40,
    enableHiding: false,
  },
];
