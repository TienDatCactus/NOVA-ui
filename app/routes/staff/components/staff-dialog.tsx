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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CreateStaffRequestSchema } from "~/services/api/staff/staff.schema";
import type { CreateStaffRequest } from "~/services/api/staff/dto";
import { StaffService } from "~/services/api/staff";
import { UserService } from "~/services/api/user";
import { getRoleDisplayName } from "~/services/types/users.types";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function StaffDialog({
  open,
  onOpenChange,
  onSuccess,
}: StaffDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const form = useForm<CreateStaffRequest>({
    resolver: zodResolver(CreateStaffRequestSchema),
    defaultValues: {
      userId: "",
      code: "",
      fullName: "",
      phoneNumber: "",
      email: "",
      position: "",
      department: "",
      baseSalary: 0,
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

  const onSubmit = async (data: CreateStaffRequest) => {
    setIsSubmitting(true);
    try {
      await StaffService.createStaff(data);
      toast.success("Tạo nhân sự thành công");
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Staff dialog error:", error);
      toast.error("Không thể tạo nhân sự mới");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm nhân sự mới</DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin để tạo nhân sự mới
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* User ID */}
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="UUID của user (không bắt buộc)"
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Để trống nếu không có user
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã nhân sự</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="NV001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Position - Changed to Select with API roles */}
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

              {/* Base Salary */}
              <FormField
                control={form.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Lương cơ bản (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="10000000"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Nhập số tiền lương cơ bản hàng tháng
                    </FormDescription>
                    <FormMessage />
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
                {isSubmitting ? "Đang xử lý..." : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
