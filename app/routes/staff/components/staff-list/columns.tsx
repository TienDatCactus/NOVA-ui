import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import type { StaffListItem } from "~/services/api/staff/dto";

interface StaffColumnsProps {
  onEdit?: (staff: StaffListItem) => void;
  onDelete?: (staff: StaffListItem) => void;
  onView?: (staff: StaffListItem) => void;
}

export const createStaffColumns = ({
  onEdit,
  onDelete,
  onView,
}: StaffColumnsProps = {}): ColumnDef<StaffListItem>[] => [
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => (
      <div className="w-12 text-center font-medium">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "code",
    header: "Mã nhân sự",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium">{row.original.code}</div>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Họ và tên",
    cell: ({ row }) => (
      <div className="min-w-[150px] font-medium">{row.original.fullName}</div>
    ),
  },
  {
    accessorKey: "position",
    header: "Chức vụ",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal">
        {row.original.position}
      </Badge>
    ),
  },
  {
    accessorKey: "department",
    header: "Phòng ban",
    cell: ({ row }) => <div className="text-sm">{row.original.department}</div>,
  },
  {
    accessorKey: "active",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "default" : "secondary"}>
        {row.original.active ? "Đang làm việc" : "Đã nghỉ việc"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      const staff = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(staff)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(staff)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(staff)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa nhân sự
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
