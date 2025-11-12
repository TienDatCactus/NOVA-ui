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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UpdateStaffRequestSchema } from "~/services/api/staff/staff.schema";
import type { UpdateStaffRequest, StaffDetailItem } from "~/services/api/staff/dto";
import { StaffService } from "~/services/api/staff";
import { UserService } from "~/services/api/user";
import { getRoleDisplayName } from "~/services/types/users.types";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { z } from "zod";

type UpdateStaffFormData = z.infer<typeof UpdateStaffRequestSchema>;

interface StaffUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffDetailItem;
  onSuccess?: () => void;
}

export default function StaffUpdateDialog({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: StaffUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const form = useForm<UpdateStaffFormData>({
    resolver: zodResolver(UpdateStaffRequestSchema),
    defaultValues: {
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber ?? "",
      email: staff.email ?? "",
      position: staff.position,
      department: staff.department,
      active: staff.active,
    },
  });

  // Fetch roles when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoadingRoles(true);
      UserService.getRoleList()
        .then((data) => {
          setRoles(data);
        })
        .catch((error) => {
          console.error("Error fetching roles:", error);
          toast.error("Không thể tải danh sách vai trò");
        })
        .finally(() => {
          setIsLoadingRoles(false);
        });
    }
  }, [open]);

  // Update form values when staff changes
  useEffect(() => {
    if (open && staff) {
      form.reset({
        fullName: staff.fullName,
        phoneNumber: staff.phoneNumber ?? "",
        email: staff.email ?? "",
        position: staff.position,
        department: staff.department,
        active: staff.active,
      });
    }
  }, [open, staff, form]);

  const onSubmit = async (data: UpdateStaffFormData) => {
    setIsSubmitting(true);
    try {
      await StaffService.updateStaff(staff.id, data);
      toast.success("Cập nhật nhân sự thành công");
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Staff update error:", error);
      toast.error("Không thể cập nhật nhân sự");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa nhân sú</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin nhân sự: {staff.fullName} ({staff.code})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nguyễn Văn A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0912345678" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="staff@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position */}
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chức vụ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingRoles}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingRoles
                                ? "Đang tải vai trò..."
                                : "Chọn chức vụ"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {getRoleDisplayName(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phòng ban</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Kế toán" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="col-span-2 flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Trạng thái hoạt động</FormLabel>
                      <FormDescription>
                        Nhân sự có đang làm việc hay không
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
                {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
