import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Loader2, Save, User } from "lucide-react";
import {
  type Control,
  type FieldValues,
  type Path,
  useForm,
} from "react-hook-form";
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
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { CreateStaffDto } from "~/services/api/staff/staff/dto";
import { StaffSchema } from "~/services/api/staff/staff/staff.schema";
import { useStaffRoleList } from "../../staff-role/container/query.hooks";
import { useCreateStaff } from "../container/query.hooks";

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- Reusable Table Components ---
const LabelCell = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <TableCell className="w-[140px] bg-muted/30 font-medium border-r text-muted-foreground align-top py-3">
    {children} {required && <span className="text-red-500">*</span>}
  </TableCell>
);

const InputCell = ({ children }: { children: React.ReactNode }) => (
  <TableCell className="p-3 align-top border-0">{children}</TableCell>
);

interface FormRowProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  children: (field: any) => React.ReactNode;
  className?: string;
}

const FormRow = <T extends FieldValues>({
  control,
  name,
  label,
  required,
  children,
  className,
}: FormRowProps<T>) => {
  return (
    <TableRow className={`hover:bg-transparent ${className || ""}`}>
      <LabelCell required={required}>{label}</LabelCell>
      <InputCell>
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>{children(field)}</FormControl>
              <FormMessage className="mt-1" />
            </FormItem>
          )}
        />
      </InputCell>
    </TableRow>
  );
};

export default function CreateStaffDialog({
  open,
  onOpenChange,
}: StaffDialogProps) {
  const { data: roles } = useStaffRoleList();
  const { mutateAsync: createStaff, isPending } = useCreateStaff();

  const form = useForm<CreateStaffDto>({
    resolver: zodResolver(StaffSchema.CreateStaffSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      baseSalary: 0,
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

  const onSubmit = async (data: CreateStaffDto) => {
    await createStaff(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-lg">Thêm nhân sự mới</DialogTitle>
              <DialogDescription>
                Tạo hồ sơ nhân viên theo mẫu chuẩn
              </DialogDescription>
            </div>
            <div className="p-2 bg-muted/20 rounded-full">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col md:flex-row flex-1 overflow-y-auto"
          >
            {/* --- LEFT PANEL: PERSONAL INFO --- */}
            <div className="flex-1 p-0">
              <div className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  Thông tin cá nhân
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableBody>
                      <FormRow
                        control={form.control}
                        name="fullName"
                        label="Họ và tên"
                        required
                      >
                        {(field) => (
                          <Input
                            {...field}
                            placeholder="Ví dụ: Nguyễn Văn A"
                            className="h-9 font-medium"
                          />
                        )}
                      </FormRow>

                      <FormRow
                        control={form.control}
                        name="baseSalary"
                        label="Lương cơ bản"
                        required
                      >
                        {(field) => (
                          <Input
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.currentTarget.valueAsNumber)
                            }
                            defaultValue={0}
                            type="number"
                            className="h-9 font-mono"
                          />
                        )}
                      </FormRow>

                      <FormRow
                        control={form.control}
                        name="citizenId"
                        label="CCCD / CMND"
                      >
                        {(field) => (
                          <Input
                            {...field}
                            placeholder="0010xx..."
                            className="h-9 font-mono"
                          />
                        )}
                      </FormRow>

                      <FormRow
                        control={form.control}
                        name="gender"
                        label="Giới tính"
                      >
                        {(field) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="h-9 w-[180px]">
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Nam</SelectItem>
                              <SelectItem value="Female">Nữ</SelectItem>
                              <SelectItem value="Other">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </FormRow>

                      <FormRow
                        control={form.control}
                        name="dateOfBirth"
                        label="Ngày sinh"
                      >
                        {(field) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal h-9",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", {
                                    locale: vi,
                                  })
                                ) : (
                                  <span>DD/MM/YYYY</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                locale={vi}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </FormRow>

                      <FormRow
                        control={form.control}
                        name="note"
                        label="Ghi chú"
                      >
                        {(field) => (
                          <Textarea
                            {...field}
                            placeholder="Ghi chú thêm về nhân sự..."
                            className="resize-none min-h-[80px]"
                          />
                        )}
                      </FormRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* --- RIGHT PANEL: JOB & CONTACT --- */}
            <div className="w-full md:w-[320px] bg-muted/10 border-l flex flex-col">
              <div className="p-4 space-y-6">
                {/* Job Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    Công việc
                  </h3>
                  <div className="bg-background border rounded-md overflow-hidden shadow-sm">
                    <Table>
                      <TableBody>
                        <FormRow
                          control={form.control}
                          name="staffRoleId"
                          label="Vai trò"
                          required
                        >
                          {(field) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="h-9 border-0 focus:ring-0">
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles?.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </FormRow>
                        <FormRow
                          control={form.control}
                          name="startDate"
                          label="Ngày vào làm"
                          className="border-b-0"
                        >
                          {(field) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-9 px-3 hover:bg-transparent",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", {
                                      locale: vi,
                                    })
                                  ) : (
                                    <span>Chọn ngày</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="end"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  locale={vi}
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        </FormRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-500 rounded-full" />
                    Liên hệ
                  </h3>
                  <div className="bg-background border rounded-md overflow-hidden shadow-sm">
                    <Table>
                      <TableBody>
                        <FormRow
                          control={form.control}
                          name="phoneNumber"
                          label="Điện thoại"
                          required
                        >
                          {(field) => (
                            <Input
                              {...field}
                              type="number"
                              placeholder="09xx..."
                              className="h-9 border-0 focus-visible:ring-0"
                              onChange={(e) => field.onChange(e.target.value)} // Keep as string for phone
                            />
                          )}
                        </FormRow>
                        <FormRow
                          control={form.control}
                          name="email"
                          label="Email"
                          className="border-b-0"
                        >
                          {(field) => (
                            <Input
                              {...field}
                              type="email"
                              placeholder="abc@gmail.com"
                              className="h-9 border-0 focus-visible:ring-0"
                            />
                          )}
                        </FormRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>

        {/* Footer */}
        <DialogFooter className="p-4 border-t bg-background shrink-0 z-10">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
            className="min-w-[120px]"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Tạo hồ sơ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
