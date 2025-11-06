import { useState } from "react";
import {
  Users,
  Pencil,
  Lock,
  Unlock,
  Shield,
  MoreHorizontal,
  KeyRound,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { useUsers, useRoles } from "./container/useUsers.hooks";
import { UserDetailDialog } from "./components/user-detail-dialog";
import { UserFormDialog } from "./components/user-create-dialog";
import { UserEditDialog } from "./components/user-edit-dialog";
import { LockUserDialog } from "./components/lock-user-dialog";
import { ManageRolesDialog } from "./components/manage-roles-dialog";
import ChangePasswordDialog from "./components/change-password-dialog";
import UsersViewLayout from "./layouts/users-view.layout";
import useUserFilters from "./container/filter.hooks";
import {
  getRoleBadgeColors,
  getRoleDisplayName,
} from "~/services/types/users.types";
import type { UserItem } from "~/services/api/user/dto";

export default function Component() {
  const { data, isPending } = useUsers();
  const { data: rolesData } = useRoles();
  const { filters, updateFilter, resetFilters, filterUsers } = useUserFilters();

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [UserToEdit, setUserToEdit] = useState<UserItem | null>(null);

  // Lock/Unlock dialog states
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [lockDialogMode, setLockDialogMode] = useState<"lock" | "unlock">(
    "lock"
  );
  const [UserToLock, setUserToLock] = useState<UserItem | null>(null);

  // Manage roles dialog states
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [UserToManageRoles, setUserToManageRoles] = useState<UserItem | null>(
    null
  );

  // Change password dialog states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [UserToChangePassword, setUserToChangePassword] =
    useState<UserItem | null>(null);

  const handleViewDetail = (user: UserItem) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedUser(null);
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
  };

  const handleEdit = (user: UserItem) => {
    setUserToEdit(user);
    setIsEditOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    setUserToEdit(null);
  };

  const handleLockUser = (user: UserItem) => {
    setUserToLock(user);
    setLockDialogMode("lock");
    setIsLockDialogOpen(true);
  };

  const handleUnlockUser = (user: UserItem) => {
    setUserToLock(user);
    setLockDialogMode("unlock");
    setIsLockDialogOpen(true);
  };

  const handleManageRoles = (user: UserItem) => {
    setUserToManageRoles(user);
    setIsManageRolesOpen(true);
  };

  const handleChangePassword = (user: UserItem) => {
    setUserToChangePassword(user);
    setIsChangePasswordOpen(true);
  };

  const filteredUsers = data ? filterUsers(data) : [];

  return (
    <UsersViewLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalUsers={data?.length || 0}
      onAddUser={() => setIsCreateOpen(true)}
      roles={rolesData || []}
    >
      <Card className="flex-1 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Họ và tên</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Số điện thoại</TableHead>
                <TableHead className="font-semibold">Vai trò</TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="font-semibold text-center">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
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
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(user)}
                  >
                    <TableCell className="font-medium">
                      {user.fullName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{user.email}</span>
                        {user.emailConfirmed}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.phoneNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role) => {
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
                      {user.lockoutEnabled && user.lockoutEnd ? (
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
                              handleEdit(user);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Chỉnh sửa thông tin
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManageRoles(user);
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Quản lý vai trò
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChangePassword(user);
                            }}
                          >
                            <KeyRound className="h-4 w-4 mr-2" />
                            Đổi mật khẩu
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {user.lockoutEnabled && user.lockoutEnd ? (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlockUser(user);
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
                                handleLockUser(user);
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
                  <TableCell colSpan={6} className="h-64">
                    {filters.searchText ||
                    filters.statusFilter !== "all" ||
                    filters.roleFilter !== "all" ? (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Users />
                          </EmptyMedia>
                          <EmptyTitle>Không tìm thấy kết quả</EmptyTitle>
                          <EmptyDescription>
                            Thử điều chỉnh bộ lọc hoặc thay đổi từ khóa tìm kiếm
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Users />
                          </EmptyMedia>
                          <EmptyTitle>Chưa có tài khoản nào</EmptyTitle>
                          <EmptyDescription>
                            Bắt đầu bằng cách thêm tài khoản đầu tiên cho hệ
                            thống
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialogs */}
      {selectedUser && (
        <UserDetailDialog
          user={selectedUser}
          open={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}

      <UserFormDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit user Dialog */}
      {UserToEdit && (
        <UserEditDialog
          user={UserToEdit}
          open={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setUserToEdit(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Lock/Unlock User Dialog */}
      {UserToLock && (
        <LockUserDialog
          user={UserToLock}
          open={isLockDialogOpen}
          onClose={() => {
            setIsLockDialogOpen(false);
            setUserToLock(null);
          }}
          mode={lockDialogMode}
        />
      )}

      {/* Manage Roles Dialog */}
      {UserToManageRoles && (
        <ManageRolesDialog
          user={UserToManageRoles}
          open={isManageRolesOpen}
          onClose={() => {
            setIsManageRolesOpen(false);
            setUserToManageRoles(null);
          }}
        />
      )}
      {UserToChangePassword && (
        <ChangePasswordDialog
          open={isChangePasswordOpen}
          onOpenChange={setIsChangePasswordOpen}
          UserId={UserToChangePassword.id}
          UserName={UserToChangePassword.fullName}
          onSuccess={() => {
            setIsChangePasswordOpen(false);
            setUserToChangePassword(null);
          }}
        />
      )}
    </UsersViewLayout>
  );
}
