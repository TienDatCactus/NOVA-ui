import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2, Search } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { cn } from "~/lib/utils";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
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

import {
  useStockAdjustmentDetail,
  useUpdateStockAdjustment,
} from "../container/query.hooks";
import { StockAdjustmentsSchemas } from "~/services/api/stocks/stock-adjustments/stock-adjustments.schema";
import type { UpdateStockAdjustmentDto } from "~/services/api/stocks/stock-adjustments/dto";
import { useStockItemList } from "../../items/container/query.hooks";
import { useState } from "react";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";

interface EditStockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustmentId: string;
}

export default function EditStockAdjustmentDialog({
  open,
  onOpenChange,
  adjustmentId,
}: EditStockAdjustmentDialogProps) {
  const { data: adjustment, isPending: isLoadingAdj } =
    useStockAdjustmentDetail(adjustmentId);

  const { data: stockItems = [] } = useStockItemList({
    includeInactive: false,
  });

  const { mutate: onUpdate, isPending: isSubmitting } =
    useUpdateStockAdjustment();

  const form = useForm<UpdateStockAdjustmentDto>({
    resolver: zodResolver(StockAdjustmentsSchemas.UpdateStockAdjustmentSchema),
    values: adjustment
      ? {
          reason: adjustment.reason,
          items: adjustment.items.map((item) => ({
            itemId: item.itemId,
            quantityDiff: item.quantityDiff,
            note: item.note || "",
          })),
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // 3. Handlers
  const handleSubmit = (data: UpdateStockAdjustmentDto) => {
    onUpdate(
      { id: adjustmentId, data },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  // Loading State - Keep dialog open but show skeleton
  if (isLoadingAdj) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <Skeleton className="h-6 w-48" />
          </DialogHeader>
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!adjustment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col gap-0 p-0">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                Chỉnh sửa phiếu
                <Badge variant="secondary" className="font-mono text-sm px-2">
                  {adjustment.reference}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-1">
                Điều chỉnh thông tin và số lượng hàng hóa.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            id="edit-adjustment-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* BODY: SCROLLABLE */}
            <div className="flex-1 overflow-y-auto">
              {/* SECTION 1: REASON */}
              <div className="px-6 py-4 bg-background">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase text-muted-foreground font-bold">
                        Lý do điều chỉnh
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập lý do điều chỉnh..."
                          className="max-w-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SECTION 2: ITEMS GRID */}
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

                        {/* Item Combobox */}
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

                        {/* Quantity Input (Visual Feedback) */}
                        <TableCell className="p-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantityDiff`}
                            render={({ field: qtyField }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Counter
                                    {...qtyField}
                                    step={0.1}
                                    className={cn(
                                      "text-right font-mono w-44",
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

                        {/* Delete Action */}
                        <TableCell className="p-2 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Add Row Button */}
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
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// --- Shared Component: Item Combobox ---
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
                  value={item.name}
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <span className="font-mono text-xs text-muted-foreground w-[80px]">
                    {item.code}
                  </span>
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
