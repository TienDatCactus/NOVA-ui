import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import type { UpdateStaffRoleDto } from "~/services/api/staff/staff-role/dto";
import { StaffRoleSchema } from "~/services/api/staff/staff-role/staff-role.schema";
import {
  useStaffRoleDetail,
  useUpdateStaffRole,
} from "../container/query.hooks";

interface EditRoleDialogProps {
  open: boolean;
  onClose: () => void;
  roleId: string;
}

export default function EditRoleDialog({
  open,
  onClose,
  roleId,
}: EditRoleDialogProps) {
  const { data: role, isPending: isLoadingRole } = useStaffRoleDetail(roleId);
  const { mutate: updateRole, isPending: isUpdating } = useUpdateStaffRole();

  const form = useForm<UpdateStaffRoleDto>({
    resolver: zodResolver(StaffRoleSchema.UpdateStaffRoleSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  // Prefill form when role data loads
  useEffect(() => {
    if (role) {
      form.reset({
        code: role.code,
        name: role.name,
        description: role.description || "",
      });
    }
  }, [role, form]);

  const onSubmit = (data: UpdateStaffRoleDto) => {
    updateRole(
      {
        id: roleId,
        data: {
          code: data.code,
          name: data.name,
          description: data.description || undefined,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cập nhật vai trò</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin vai trò nhân sự
          </DialogDescription>
        </DialogHeader>

        {isLoadingRole ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mã vai trò <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: MANAGER, RECEPTIONIST..."
                        {...field}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên vai trò <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Quản lý, Lễ tân..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả vai trò và trách nhiệm..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
