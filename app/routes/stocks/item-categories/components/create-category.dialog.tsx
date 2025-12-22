import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import {
  type Control,
  type FieldValues,
  type Path,
  useForm,
} from "react-hook-form";
import { z } from "zod";
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
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { useCreateItemCategory } from "../container/query.hooks";

// --- Schema & Types ---
const createCategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

interface CreateCategoryDialogProps {
  open: boolean;
  onClose: () => void;
}

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

// --- Main Component ---
export default function CreateCategoryDialog({
  open,
  onClose,
}: CreateCategoryDialogProps) {
  const { mutate: createCategory, isPending } = useCreateItemCategory();

  const form = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const onSubmit = (data: CreateCategoryFormData) => {
    createCategory(
      {
        name: data.name,
        description: data.description || null,
        isActive: data.isActive,
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
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        {/* Header - Styled to match Item Dialog */}
        <DialogHeader className="p-4 border-b bg-muted/10">
          <div className="space-y-1">
            <DialogTitle>Tạo danh mục mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin danh mục dưới dạng bảng
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="p-4">
              {/* Table Layout */}
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableBody>
                    <FormRow
                      control={form.control}
                      name="name"
                      label="Tên danh mục"
                      required
                    >
                      {(field) => (
                        <Input
                          placeholder="VD: Đồ uống, Thực phẩm..."
                          className="h-9 font-medium"
                          {...field}
                        />
                      )}
                    </FormRow>

                    <FormRow
                      control={form.control}
                      name="description"
                      label="Mô tả"
                    >
                      {(field) => (
                        <Textarea
                          placeholder="Mô tả chi tiết về danh mục..."
                          className="resize-none min-h-[80px]"
                          rows={3}
                          {...field}
                        />
                      )}
                    </FormRow>

                    {/* Status Switch - Clean Table Row Style */}
                    <TableRow className="hover:bg-transparent border-b-0">
                      <LabelCell>Trạng thái</LabelCell>
                      <InputCell>
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-y-0 h-9">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <span className="ml-3 text-sm text-muted-foreground">
                                {field.value
                                  ? "Đang hoạt động"
                                  : "Ngừng hoạt động"}
                              </span>
                            </FormItem>
                          )}
                        />
                      </InputCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="p-4 border-t bg-background">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Tạo danh mục
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
