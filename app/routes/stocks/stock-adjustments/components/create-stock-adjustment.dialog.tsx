import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2, Search, ArrowRight } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { cn } from "~/lib/utils"; // Standard shadcn util
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
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { useCreateStockAdjustment } from "../container/query.hooks";
import type { CreateStockAdjustmentDto } from "~/services/api/stocks/stock-adjustments/dto";
import { StockAdjustmentsSchemas } from "~/services/api/stocks/stock-adjustments/stock-adjustments.schema";
import { useStockItemList } from "../../items/container/query.hooks";
import { useState } from "react";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";

interface CreateStockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateStockAdjustmentDialog({
  open,
  onOpenChange,
}: CreateStockAdjustmentDialogProps) {
  // 1. Data & Mutation
  const { data: stockItems = [] } = useStockItemList({
    includeInactive: false,
  });

  const { mutate: onCreate, isPending: isSubmitting } =
    useCreateStockAdjustment();

  // 2. Form Setup
  const form = useForm<CreateStockAdjustmentDto>({
    resolver: zodResolver(StockAdjustmentsSchemas.CreateStockAdjustmentSchema),
    defaultValues: {
      reason: "",
      items: [
        {
          itemId: "",
          quantityDiff: 0,
          note: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // 3. Handlers
  const handleSubmit = (data: CreateStockAdjustmentDto) => {
    onCreate(data, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col gap-0 p-0">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Tạo phiếu điều chỉnh
              </DialogTitle>
              <DialogDescription className="mt-1">
                Nhập liệu dạng bảng. Sử dụng phím Tab để di chuyển nhanh.
              </DialogDescription>
            </div>
            {/* Global Actions could go here */}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-adjustment-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4 bg-background">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase text-muted-foreground font-bold">
                        Lý do / Ghi chú chung
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Kiểm kê kho tháng 11..."
                          className="max-w-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SECTION 2: THE DATA GRID */}
              <div className="border-t">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="w-[50px] text-center">#</TableHead>
                      <TableHead className="w-[350px]">Hàng hóa</TableHead>
                      <TableHead className="w-[150px]">
                        Số lượng (+/-)
                      </TableHead>
                      <TableHead className="min-w-[200px]">
                        Ghi chú dòng
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow
                        key={field.id}
                        className="group hover:bg-muted/5"
                      >
                        {/* Index */}
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>

                        {/* Item Selection (Combobox) */}
                        <TableCell className="p-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.itemId`}
                            render={({ field: itemField }) => (
                              <ItemCombobox
                                value={itemField.value}
                                onChange={itemField.onChange}
                                items={stockItems}
                                hasError={
                                  !!form.formState.errors.items?.[index]?.itemId
                                }
                              />
                            )}
                          />
                        </TableCell>

                        {/* Quantity Input */}
                        <TableCell className="p-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantityDiff`}
                            render={({ field: qtyField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Counter
                                    value={qtyField.value}
                                    onChange={qtyField.onChange}
                                    className={cn(
                                      "text-right font-mono",
                                      qtyField.value < 0
                                        ? "text-red-600 font-bold bg-red-50 border-red-200"
                                        : qtyField.value > 0
                                          ? "text-green-600 font-bold bg-green-50 border-green-200"
                                          : ""
                                    )}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* Note Input */}
                        <TableCell className="p-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.note`}
                            render={({ field: noteField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    {...noteField}
                                    placeholder="Ghi chú..."
                                    className="border-transparent focus:border-input bg-transparent focus:bg-background"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="p-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1} // Prevent deleting last row if desired
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* "Add Row" Ghost Row */}
                    <TableRow
                      className="hover:bg-transparent cursor-pointer border-t-2 border-dashed"
                      onClick={() =>
                        append({ itemId: "", quantityDiff: 0, note: "" })
                      }
                    >
                      <TableCell colSpan={5} className="p-2">
                        <div className="flex items-center justify-center py-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm dòng mới
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* FOOTER */}
            <DialogFooter className="px-6 py-4 border-t">
              <div className="flex items-center text-sm text-muted-foreground mr-auto">
                Tổng cộng:{" "}
                <span className="font-bold text-foreground ml-1">
                  {fields.length}
                </span>{" "}
                mục
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Lưu phiếu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ItemCombobox({
  value,
  onChange,
  items,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  items: any[];
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedItem = items.find((item) => item.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal px-3",
            !value && "text-muted-foreground",
            hasError && "border-destructive bg-destructive/5"
          )}
        >
          {selectedItem ? (
            <span className="truncate">
              <span className="font-mono text-xs text-muted-foreground mr-2">
                {selectedItem.code}
              </span>
              {selectedItem.name}
            </span>
          ) : (
            "Chọn hàng hóa..."
          )}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm mã hoặc tên..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name} // Use name for searching
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <span className="font-mono text-xs text-muted-foreground w-[80px]">
                    {item.code}
                  </span>
                  <span>{item.name}</span>
                  {/* Add Check icon if selected if desired */}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
