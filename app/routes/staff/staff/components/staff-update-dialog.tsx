import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type {
  StaffDetailDto,
  UpdateStaffDto,
} from "~/services/api/staff/staff/dto";
import { StaffSchema } from "~/services/api/staff/staff/staff.schema";
import { useUpdateStaff } from "../container/query.hooks";
import { useStaffRoleList } from "~/routes/staff/staff-role/container/query.hooks";

interface StaffUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffDetailDto;
}

export default function StaffUpdateDialog({
  open,
  onOpenChange,
  staff,
}: StaffUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: roles } = useStaffRoleList();
  const { mutateAsync: updateStaff } = useUpdateStaff();
  const form = useForm<UpdateStaffDto>({
    resolver: zodResolver(StaffSchema.UpdateStaffSchema),
    defaultValues: {
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber ?? "",
      email: staff.email ?? "",
      gender: staff.gender ?? "",
      dateOfBirth: staff.dateOfBirth ? parseISO(staff.dateOfBirth) : undefined,
      citizenId: staff.citizenId ?? "",
      startDate: staff.startDate ? parseISO(staff.startDate) : undefined,
      note: staff.note ?? "",
      staffRoleId: staff.staffRoleId ?? "",
    },
  });

  useEffect(() => {
    if (open && staff) {
      form.reset({
        fullName: staff.fullName,
        phoneNumber: staff.phoneNumber ?? "",
        email: staff.email ?? "",
        gender: staff.gender ?? "",
        dateOfBirth: staff.dateOfBirth
          ? parseISO(staff.dateOfBirth)
          : undefined,
        citizenId: staff.citizenId ?? "",
        startDate: staff.startDate ? parseISO(staff.startDate) : undefined,
        note: staff.note ?? "",
        staffRoleId: staff.staffRoleId ?? "",
      });
    }
  }, [open, staff, form]);

  const onSubmit = async (data: UpdateStaffDto) => {
    setIsSubmitting(true);
    try {
      await updateStaff(
        {
          id: staff.id,
          data: form.getValues(),
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
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
          <DialogTitle>Chỉnh sửa thông tin nhân sự</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin nhân sự: {staff.fullName} ({staff.code})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      Họ và tên <span className="text-destructive">*</span>
                    </FormLabel>
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
                    <FormLabel>
                      Số điện thoại <span className="text-destructive">*</span>
                    </FormLabel>
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

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Nam</SelectItem>
                        <SelectItem value="Female">Nữ</SelectItem>
                        <SelectItem value="Other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn ngày sinh"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Citizen ID */}
              <FormField
                control={form.control}
                name="citizenId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số CCCD</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="001234567890"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu làm việc</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn ngày bắt đầu"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Staff Role ID - Fetch from API */}
              <FormField
                control={form.control}
                name="staffRoleId"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      Vai trò nhân sự{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles?.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Note */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Thông tin bổ sung về nhân sự..."
                        rows={3}
                      />
                    </FormControl>
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
                {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
