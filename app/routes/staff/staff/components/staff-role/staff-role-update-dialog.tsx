import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { UpdateStaffRoleRequestSchema } from "~/services/api/staff/staff-role/staff-role.schema";
import type {
  UpdateStaffRoleRequest,
  StaffRoleItem,
} from "~/services/api/staff/staff-role/dto";
import { StaffRoleService } from "~/services/api/staff/staff-role";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { z } from "zod";

interface StaffRoleUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: StaffRoleItem;
  onSuccess?: () => void;
}

type UpdateStaffRoleFormData = z.infer<typeof UpdateStaffRoleRequestSchema>;

export default function StaffRoleUpdateDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: StaffRoleUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateStaffRoleFormData>({
    resolver: zodResolver(UpdateStaffRoleRequestSchema),
    defaultValues: {
      name: role.name,
      code: role.code,
      description: role.description || "",
    },
  });

  // Update form when role changes
  useEffect(() => {
    if (open && role) {
      form.reset({
        name: role.name,
        code: role.code,
        description: role.description || "",
      });
    }
  }, [open, role, form]);

  const onSubmit = async (data: UpdateStaffRoleFormData) => {
    setIsSubmitting(true);

    try {
      const requestData: UpdateStaffRoleRequest = {
        name: data.name,
        code: data.code,
        description: data.description || undefined,
      };

      await StaffRoleService.updateStaffRole(role.id, requestData);

      toast.success(`Đã cập nhật vai trò ${data.name}`);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Update staff role error:", error);
      toast.error("Không thể cập nhật vai trò. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cập nhật vai trò</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin vai trò nhân sự
          </DialogDescription>
        </DialogHeader>

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
                      placeholder="Mô tả vai trò..."
                      className="resize-none"
                      rows={3}
                      {...field}
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
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
