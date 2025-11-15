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
import { DatePicker } from "~/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UpdateStaffFormSchema } from "~/services/api/staff/staff.schema";
import type {
  UpdateStaffRequest,
  StaffDetailItem,
} from "~/services/api/staff/dto";
import { StaffService } from "~/services/api/staff";
import { StaffRoleService } from "~/services/api/staff-role";
import type { StaffRoleItem } from "~/services/api/staff-role/dto";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { z } from "zod";
import { parseISO, format } from "date-fns";
import { Plus } from "lucide-react";
import StaffRoleCreateDialog from "./staff-role-create-dialog";

type UpdateStaffFormData = z.infer<typeof UpdateStaffFormSchema>;

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
  const [roles, setRoles] = useState<StaffRoleItem[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const form = useForm<UpdateStaffFormData>({
    resolver: zodResolver(UpdateStaffFormSchema),
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

  // Fetch staff roles when dialog opens
  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  const fetchRoles = () => {
    setIsLoadingRoles(true);
    StaffRoleService.getStaffRoleList()
      .then((response) => {
        setRoles(response.data);
      })
      .catch((error) => {
        console.error("Error fetching staff roles:", error);
        toast.error("Không thể tải danh sách vai trò");
      })
      .finally(() => {
        setIsLoadingRoles(false);
      });
  };

  const handleRoleCreated = (roleId: string, roleName: string) => {
    // Refresh roles list
    fetchRoles();
    // Auto-select the newly created role
    form.setValue("staffRoleId", roleId);
    toast.success(`Đã chọn vai trò: ${roleName}`);
  };

  // Update form values when staff changes
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

  const onSubmit = async (data: UpdateStaffFormData) => {
    setIsSubmitting(true);
    try {
      // Convert Date objects to ISO strings for API
      const payload: UpdateStaffRequest = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth
          ? format(data.dateOfBirth, "yyyy-MM-dd")
          : undefined,
        citizenId: data.citizenId,
        startDate: data.startDate
          ? format(data.startDate, "yyyy-MM-dd")
          : undefined,
        note: data.note,
        staffRoleId: data.staffRoleId,
      };

      await StaffService.updateStaff(staff.id, payload);
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
                      Vai trò nhân sự <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="flex gap-2">
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
                                  : "Chọn vai trò"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsRoleDialogOpen(true)}
                        title="Thêm vai trò mới"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
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

      {/* Staff Role Create Dialog */}
      <StaffRoleCreateDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        onSuccess={handleRoleCreated}
      />
    </Dialog>
  );
}
