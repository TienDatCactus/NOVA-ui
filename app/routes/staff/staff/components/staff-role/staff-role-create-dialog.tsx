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
import { CreateStaffRoleRequestSchema } from "~/services/api/staff/staff-role/staff-role.schema";
import type { CreateStaffRoleRequest } from "~/services/api/staff/staff-role/dto";
import { StaffRoleService } from "~/services/api/staff/staff-role";
import { toast } from "sonner";
import { useState } from "react";
import type { z } from "zod";

interface StaffRoleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (roleId: string, roleName: string) => void;
}

type CreateStaffRoleFormData = z.infer<typeof CreateStaffRoleRequestSchema>;

export default function StaffRoleCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: StaffRoleCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateStaffRoleFormData>({
    resolver: zodResolver(CreateStaffRoleRequestSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateStaffRoleFormData) => {
    setIsSubmitting(true);

    try {
      const requestData: CreateStaffRoleRequest = {
        name: data.name,
        code: data.code,
        description: data.description || undefined,
      };

      const response = await StaffRoleService.createStaffRole(requestData);

      toast.success(`Đã tạo vai trò ${data.name}`);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Create staff role error:", error);
      toast.error("Không thể tạo vai trò. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo vai trò mới</DialogTitle>
          <DialogDescription>
            Thêm vai trò nhân sự mới vào hệ thống
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
                {isSubmitting ? "Đang tạo..." : "Tạo vai trò"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
