import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Loader2, Lock, Mail } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type {
  StaffListItemDto,
  UpdateStaffDto,
} from "~/services/api/staff/staff/dto";
import { StaffSchema } from "~/services/api/staff/staff/staff.schema";
import { useStaffRoleList } from "../../staff-role/container/query.hooks";
import { useStaffDetail, useUpdateStaff } from "../container/query.hooks";

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffListItemDto | null;
  onSuccess?: () => void;
}

export default function EditStaffDialog({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: EditStaffDialogProps) {
  const { data: roles } = useStaffRoleList();

  const { data: staffDetail, isLoading: isLoadingDetail } = useStaffDetail(
    staff?.id || "",
    { enabled: open }
  );

  const { mutateAsync: updateStaff, isPending } = useUpdateStaff();

  const form = useForm<UpdateStaffDto>({
    resolver: zodResolver(StaffSchema.UpdateStaffSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      gender: "",
      dateOfBirth: undefined,
      citizenId: "",
      startDate: undefined,
      note: "",
      staffRoleId: "",
    },
  });

  // Effect: Reset form khi có dữ liệu chi tiết từ API
  useEffect(() => {
    if (staffDetail && open) {
      form.reset({
        fullName: staffDetail.fullName || "",
        phoneNumber: staffDetail.phoneNumber || "",
        email: staffDetail.email || "",
        gender: staffDetail.gender || "",
        citizenId: staffDetail.citizenId || "",
        note: staffDetail.note || "",
        staffRoleId: staffDetail.staffRoleId || "",
        dateOfBirth: staffDetail.dateOfBirth
          ? typeof staffDetail.dateOfBirth === "string"
            ? parseISO(staffDetail.dateOfBirth)
            : staffDetail.dateOfBirth
          : undefined,
        startDate: staffDetail.startDate
          ? typeof staffDetail.startDate === "string"
            ? parseISO(staffDetail.startDate)
            : staffDetail.startDate
          : undefined,
      });
    }
  }, [form, staffDetail]);

  const onSubmit = async (data: UpdateStaffDto) => {
    if (!staff?.id) return;

    try {
      await updateStaff({ id: staff.id, data });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Update staff error:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5 shrink-0">
          <DialogTitle className="text-lg">Cập nhật hồ sơ</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin nhân viên{" "}
            <span className="font-medium text-foreground">
              {staff.fullName}
            </span>
          </DialogDescription>
        </DialogHeader>

        {isLoadingDetail ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Đang tải thông tin...</p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 overflow-y-auto"
            >
              <div className="p-6 space-y-8">
                {/* 1. THÔNG TIN ĐỊNH DANH */}
                <section className="space-y-4">
                  <h1 className="font-bold">Thông tin định danh</h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name (Trái) */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Họ và tên{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Code & Gender (Phải) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">
                          Mã nhân viên
                        </FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70" />
                          <Input
                            disabled
                            value={staff.code}
                            className="pl-8 bg-muted/50 font-mono text-muted-foreground border-dashed cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giới tính</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn" />
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
                    </div>

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày sinh</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal pl-3",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", {
                                      locale: vi,
                                    })
                                  ) : (
                                    <span>DD/MM/YYYY</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                captionLayout="dropdown"
                                locale={vi}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="citizenId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CCCD / CMND</FormLabel>
                          <FormControl>
                            <Input {...field} className="font-mono" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator className="my-2" />

                {/* 2. LIÊN HỆ */}
                <section className="space-y-4">
                  <h1 className="font-bold">Thông tin liên hệ</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Số điện thoại{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator className="my-2" />

                {/* 3. CÔNG VIỆC */}
                <section className="space-y-4">
                  <h1 className="font-bold">Thiết lập công việc</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="staffRoleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Chức vụ / Chức vụ{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select {...field}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn Chức vụ" />
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày bắt đầu</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal pl-3",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", {
                                      locale: vi,
                                    })
                                  ) : (
                                    <span>DD/MM/YYYY</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                captionLayout="dropdown"
                                locale={vi}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Ghi chú</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="resize-none"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </div>

              <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[120px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Lưu thay
                      đổi
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
