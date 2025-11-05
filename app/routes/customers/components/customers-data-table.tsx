import {
  MoreHorizontal,
  Pencil,
  Lock,
  Unlock,
  Shield,
  KeyRound,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import type { CustomerItem } from "~/services/api/customer/dto";
import {
  getRoleBadgeColors,
  getRoleDisplayName,
} from "~/services/types/customers.types";

interface CustomersDataTableProps {
  customers: CustomerItem[];
  isLoading: boolean;
  onViewDetail: (customer: CustomerItem) => void;
  onEdit: (customer: CustomerItem) => void;
  onManageRoles: (customer: CustomerItem) => void;
  onChangePassword: (customer: CustomerItem) => void;
  onLockUser: (customer: CustomerItem) => void;
  onUnlockUser: (customer: CustomerItem) => void;
}

export default function CustomersDataTable({
  customers,
  isLoading,
  onViewDetail,
  onEdit,
  onManageRoles,
  onChangePassword,
  onLockUser,
  onUnlockUser,
}: CustomersDataTableProps) {
  return (
    <Card className="shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Họ và tên</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Số điện thoại</TableHead>
              <TableHead className="font-semibold">Vai trò</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onViewDetail(customer)}
                >
                  <TableCell className="font-medium">
                    {customer.fullName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{customer.email}</span>
                      {customer.emailConfirmed}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.phoneNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {customer.roles.map((role) => {
                        const colors = getRoleBadgeColors(role);
                        return (
                          <Badge
                            key={role}
                            variant="outline"
                            className={`text-xs ${colors.bg} ${colors.text} ${colors.border} shadow-sm`}
                          >
                            {getRoleDisplayName(role)}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.lockoutEnabled && customer.lockoutEnd ? (
                      <Badge variant="destructive" className="shadow-sm">
                        Bị khóa
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                      >
                        Hoạt động
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(customer);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Chỉnh sửa thông tin
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onManageRoles(customer);
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Quản lý vai trò
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangePassword(customer);
                          }}
                        >
                          <KeyRound className="h-4 w-4 mr-2" />
                          Đổi mật khẩu
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {customer.lockoutEnabled && customer.lockoutEnd ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnlockUser(customer);
                            }}
                            className="text-green-600 focus:text-green-600"
                          >
                            <Unlock className="h-4 w-4 mr-2" />
                            Mở khóa tài khoản
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onLockUser(customer);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Khóa tài khoản
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-12 w-12 opacity-20" />
                    <p>Không tìm thấy tài khoản phù hợp</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
