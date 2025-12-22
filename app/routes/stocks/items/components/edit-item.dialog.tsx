import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Package, Save } from "lucide-react";
import { useEffect } from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  useForm,
} from "react-hook-form";
import type z from "zod";

import { Badge } from "~/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";

import { onError } from "~/lib/utils";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import { FormSchema } from "~/services/schema/forms.schema";
import { useItemCategories } from "../../item-categories/container/query.hooks";
import {
  useStockItemDetail,
  useUpdateStockItem,
} from "../container/query.hooks";

// --- Types ---
export type UpdateItemFormData = z.infer<
  typeof FormSchema.UpdateItemFormSchema
>;

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
}

// --- Reusable Components (Matching Create Dialog) ---
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
export default function EditItemDialog({
  open,
  onOpenChange,
  itemId,
}: EditItemDialogProps) {
  // --- Data Fetching ---
  const { data: item } = useStockItemDetail(itemId, undefined, {
    enabled: open,
  });
  const { data: categories = [] } = useItemCategories({
    includeInactive: true,
  });
  const { data: units = [] } = useUnits({ includeInactive: true });

  const { mutate: updateItem, isPending: isSubmitting } = useUpdateStockItem();

  const form = useForm<UpdateItemFormData>({
    resolver: zodResolver(FormSchema.UpdateItemFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      unitId: "",
      unitCost: 0,
      unitPrice: 0,
      minStock: 0,
      maxStock: 0,
      isActive: true,
    },
  });

  // --- Effect: Sync Data to Form ---
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description ?? "",
        categoryId: item.categoryId,
        unitId: item.unitId,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice,
        minStock: item.minStock ?? 0,
        maxStock: item.maxStock ?? 0,
        isActive: item.isActive,
      });
    }
  }, [item, form]);

  const onSubmit = (data: UpdateItemFormData) => {
    updateItem({ id: itemId, data }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-muted/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle>Chỉnh sửa hàng hóa</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                Cập nhật thông tin chi tiết cho sản phẩm
              </DialogDescription>
            </div>
            {/* SKU Badge positioned in header */}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">SKU:</span>
              <Badge variant="outline" className="font-mono bg-background">
                {item?.code || "..."}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="flex flex-col md:flex-row flex-1 overflow-y-auto"
          >
            {/* --- LEFT PANEL: GENERAL INFO --- */}
            <div className="flex-1 p-0">
              <div className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  Thông tin chung
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableBody>
                      <FormRow
                        control={form.control}
                        name="name"
                        label="Tên hàng hóa"
                        required
                      >
                        {(field) => (
                          <Input
                            placeholder="VD: Sữa tươi Vinamilk"
                            className="h-9 font-medium"
                            {...field}
                          />
                        )}
                      </FormRow>

                      <FormRow
                        control={form.control}
                        name="categoryId"
                        label="Danh mục"
                        required
                      >
                        {(field) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </FormRow>

                      <FormRow
                        control={form.control}
                        name="unitId"
                        label="Đơn vị tính"
                        required
                      >
                        {(field) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="h-9 w-[180px]">
                              <SelectValue placeholder="Chọn đơn vị" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  {unit.name} ({unit.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </FormRow>

                      <FormRow
                        control={form.control}
                        name="description"
                        label="Ghi chú"
                      >
                        {(field) => (
                          <Textarea
                            placeholder="Mô tả chi tiết..."
                            className="resize-none min-h-[80px]"
                            {...field}
                          />
                        )}
                      </FormRow>

                      <TableRow className="hover:bg-transparent border-b-0">
                        <LabelCell>Trạng thái</LabelCell>
                        <InputCell>
                          <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 bg-muted/20">
                                <span className="text-sm px-2">Hoạt động</span>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </InputCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* --- RIGHT PANEL: METRICS --- */}
            <div className="w-full md:w-[320px] bg-muted/10 border-l flex flex-col">
              <div className="p-4 space-y-6">
                {/* Price Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-500 rounded-full" />
                    Thiết lập giá
                  </h3>
                  <div className="bg-background border rounded-md overflow-hidden shadow-sm">
                    <Table>
                      <TableBody>
                        <FormRow
                          control={form.control}
                          name="unitCost"
                          label="Giá vốn"
                        >
                          {(field) => (
                            <div className="relative">
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.valueAsNumber))
                                }
                                endAddon={
                                  <span className="text-xs text-muted-foreground">
                                    đ
                                  </span>
                                }
                              />
                            </div>
                          )}
                        </FormRow>
                        <FormRow
                          control={form.control}
                          name="unitPrice"
                          label="Giá bán"
                          className="border-b-0"
                        >
                          {(field) => (
                            <div className="relative">
                              <Input
                                type="number"
                                className="font-bold text-green-700"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.valueAsNumber))
                                }
                                endAddon={
                                  <span className="text-xs text-muted-foreground">
                                    đ
                                  </span>
                                }
                              />
                            </div>
                          )}
                        </FormRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Separator />

                {/* Stock Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-500 rounded-full" />
                    Định mức tồn kho
                  </h3>
                  <div className="bg-background border rounded-md overflow-hidden shadow-sm">
                    <Table>
                      <TableBody>
                        <FormRow
                          control={form.control}
                          name="minStock"
                          label="Tối thiểu"
                        >
                          {(field) => (
                            <Input
                              type="number"
                              className="text-center h-8"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.valueAsNumber))
                              }
                            />
                          )}
                        </FormRow>
                        <FormRow
                          control={form.control}
                          name="maxStock"
                          label="Tối đa"
                          className="border-b-0"
                        >
                          {(field) => (
                            <Input
                              type="number"
                              className="text-center h-8"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.valueAsNumber))
                              }
                            />
                          )}
                        </FormRow>
                      </TableBody>
                    </Table>
                    <div className="p-2 bg-muted/20 text-[11px] text-muted-foreground text-center">
                      Cảnh báo sẽ kích hoạt khi tồn kho nằm ngoài khoảng này.
                    </div>
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
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit, onError)}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
