import {
  Delete,
  KeyRound,
  Lock,
  MoreHorizontal,
  Pencil,
  Shield,
  Unlock,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { UserItem } from "~/services/api/user/dto";
import ChangePasswordDialog from "../components/change-password-dialog";
import { LockUserDialog } from "../components/lock-user-dialog";
import { ManageRolesDialog } from "../components/manage-roles-dialog";
import { UserEditDialog } from "../components/user-edit-dialog";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useDeleteUser } from "../container/query.hooks";

interface ActionsMenuCellProps {
  user: UserItem;
}

function ActionsMenuCell({ user }: ActionsMenuCellProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [lockDialogMode, setLockDialogMode] = useState<"lock" | "unlock">(
    "lock"
  );

  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const { mutate } = useDeleteUser();
  const handleLockUser = () => {
    setLockDialogMode("lock");
    setIsLockDialogOpen(true);
  };

  const handleUnlockUser = () => {
    setLockDialogMode("unlock");
    setIsLockDialogOpen(true);
  };

  const handleDeleteAccount = () => {
    mutate(user.id, {
      onSuccess: () => {
        setIsDeleteAccountOpen(false);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setIsEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Chỉnh sửa thông tin
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setIsManageRolesOpen(true);
            }}
          >
            <Shield className="h-4 w-4 mr-2" />
            Quản lý vai trò
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setIsChangePasswordOpen(true);
            }}
          >
            <KeyRound className="h-4 w-4 mr-2" />
            Đổi mật khẩu
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setIsDeleteAccountOpen(true);
            }}
          >
            <Delete className="h-4 w-4 mr-2" />
            Xóa tài khoản
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {user.lockoutEnd && new Date(user.lockoutEnd) > new Date() ? (
            <DropdownMenuItem
              onClick={handleUnlockUser}
              className="text-green-600 focus:text-green-600"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Mở khóa tài khoản
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onClick={handleLockUser}>
              <Lock className="h-4 w-4 mr-2" />
              Khóa tài khoản
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <UserEditDialog
        user={user}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      {/* Lock/Unlock Dialog */}
      <LockUserDialog
        user={user}
        open={isLockDialogOpen}
        onClose={() => setIsLockDialogOpen(false)}
        mode={lockDialogMode}
      />

      {/* Manage Roles Dialog */}
      <ManageRolesDialog
        user={user}
        open={isManageRolesOpen}
        onClose={() => setIsManageRolesOpen(false)}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        user={user}
      />
      <AlertDialog
        open={isDeleteAccountOpen}
        onOpenChange={setIsDeleteAccountOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Tiếp tục
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ActionsMenuCell;
