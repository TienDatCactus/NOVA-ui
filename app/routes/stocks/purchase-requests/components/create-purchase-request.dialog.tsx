import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { CreatePurchaseRequestDto } from "~/services/api/stocks/purchase-requests/dto";
import { PurchaseRequestsSchemas } from "~/services/api/stocks/purchase-requests/purchase-requests.schema";
import { useStockItemList } from "../../items/container/query.hooks";
import { useCreatePurchaseRequest } from "../container/query.hooks";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";
import { useEffect } from "react";
import { formatMoney } from "~/lib/utils";

interface CreatePurchaseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItems?: StockItemsListItemDto[];
}

export default function CreatePurchaseRequestDialog({
  open,
  onOpenChange,
  initialItems,
}: CreatePurchaseRequestDialogProps) {
  const { data: stockItems = [] } = useStockItemList({
    includeInactive: false,
  });

  const { mutate: onSubmit, isPending: isSubmitting } =
    useCreatePurchaseRequest();

  const form = useForm<CreatePurchaseRequestDto>({
    resolver: zodResolver(PurchaseRequestsSchemas.CreatePurchaseRequestSchema),
    mode: "onSubmit",
    defaultValues: {
      notes: undefined,
      items: [
        {
          itemId: null,
          freeTextItemName: "",
          freeTextItemDescription: undefined,
          freeTextUnitName: undefined,
          quantity: 1,
          unitCost: 0,
          note: undefined,
        },
      ],
    },
  });

  // Populate form with initial items when dialog opens with low stock items
  useEffect(() => {
    if (open && initialItems && initialItems.length > 0) {
      const formattedItems = initialItems.map((item) => ({
        itemId: item.id,
        freeTextItemName: item.name,
        freeTextItemDescription: item.description || undefined,
        freeTextUnitName: item.unitName,
        quantity: Math.max(1, (item.minStock || 0) - (item.currentStock || 0)),
        unitCost: item.unitCost,
        note: `Tồn kho hiện tại: ${item.currentStock || 0}/${item.minStock || 0}`,
      }));

      form.reset({
        notes: `Yêu cầu nhập hàng cho ${initialItems.length} mặt hàng sắp hết`,
        items: formattedItems,
      });
    } else if (open && !initialItems) {
      // Reset to default when opening without initial items
      form.reset({
        notes: undefined,
        items: [
          {
            itemId: null,
            freeTextItemName: "",
            freeTextItemDescription: undefined,
            freeTextUnitName: undefined,
            quantity: 1,
            unitCost: 0,
            note: undefined,
          },
        ],
      });
    }
  }, [open, initialItems]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleSubmit = (data: CreatePurchaseRequestDto) => {
    onSubmit(data, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  const addItem = () => {
    append({
      itemId: null,
      freeTextItemName: "",
      freeTextItemDescription: undefined,
      freeTextUnitName: undefined,
      quantity: 1,
      unitCost: 0,
      note: undefined,
    });
  };

  // Calculate total estimated cost
  const totalCost = fields.reduce((sum, _, index) => {
    const qty = form.watch(`items.${index}.quantity`) || 0;
    const cost = form.watch(`items.${index}.unitCost`) || 0;
    return sum + qty * cost;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Tạo yêu cầu mua hàng
              </DialogTitle>
              <DialogDescription className="mt-1">
                Nhập liệu dạng bảng. Sử dụng phím Tab để di chuyển nhanh.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-purchase-request-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4 bg-background">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase text-muted-foreground font-bold">
                        Ghi chú chung
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: Cần mua gấp cho sự kiện cuối tháng..."
                          className="max-w-md"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="w-[50px] text-center">#</TableHead>
                      <TableHead className="w-[250px]">Hàng hóa</TableHead>
                      <TableHead className="w-[200px]">
                        Tên hàng (Tự nhập)
                      </TableHead>
                      <TableHead className="w-[100px]">ĐVT</TableHead>
                      <TableHead className="w-[100px]">Số lượng</TableHead>
                      <TableHead className="w-[140px]">
                        Đơn giá dự kiến
                      </TableHead>
                      <TableHead className="w-[140px] text-right">
                        Thành tiền
                      </TableHead>
                      <TableHead className="min-w-[200px]">Ghi chú</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      // Watch values for row calculation
                      const quantity =
                        form.watch(`items.${index}.quantity`) || 0;
                      const unitCost =
                        form.watch(`items.${index}.unitCost`) || 0;
                      const subtotal = quantity * unitCost;
                      const selectedItemId = form.watch(
                        `items.${index}.itemId`
                      );

                      return (
                        <TableRow
                          key={field.id}
                          className="group hover:bg-muted/5"
                        >
                          {/* Index */}
                          <TableCell className="text-center font-medium text-muted-foreground p-2">
                            {index + 1}
                          </TableCell>

                          {/* Item Selection */}
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.itemId`}
                              render={({ field: itemField }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Select
                                      onValueChange={(value) => {
                                        if (value === "empty") {
                                          itemField.onChange(null);
                                          form.setValue(
                                            `items.${index}.freeTextItemName`,
                                            ""
                                          );
                                          form.setValue(
                                            `items.${index}.freeTextUnitName`,
                                            undefined
                                          );
                                          form.setValue(
                                            `items.${index}.unitCost`,
                                            0
                                          );
                                        } else {
                                          itemField.onChange(value);
                                          const item = stockItems.find(
                                            (i) => i.id === value
                                          );
                                          if (item) {
                                            form.setValue(
                                              `items.${index}.freeTextItemName`,
                                              item.name
                                            );
                                            form.setValue(
                                              `items.${index}.freeTextUnitName`,
                                              item.unitName
                                            );
                                            form.setValue(
                                              `items.${index}.unitCost`,
                                              item.unitCost
                                            );
                                          }
                                        }
                                      }}
                                      value={itemField.value || "empty"}
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Chọn hàng" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="empty">
                                          <span className="text-muted-foreground italic">
                                            Nhập thủ công
                                          </span>
                                        </SelectItem>
                                        {stockItems.map((item) => {
                                          const isSelected =
                                            form
                                              .getValues("items")
                                              .some(
                                                (itm: any) =>
                                                  itm.itemId === item.id
                                              ) && itemField.value !== item.id;
                                          return (
                                            <SelectItem
                                              disabled={isSelected}
                                              key={item.id}
                                              value={item.id}
                                            >
                                              {item.code} - {item.name}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Free Text Name */}
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.freeTextItemName`}
                              render={({ field: nameField }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      {...nameField}
                                      value={nameField.value || ""}
                                      placeholder="Tên hàng hóa"
                                      className="h-9"
                                      readOnly={!!selectedItemId} // Read-only if item selected
                                      disabled={!!selectedItemId}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Unit */}
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.freeTextUnitName`}
                              render={({ field: unitField }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      {...unitField}
                                      value={unitField.value || ""}
                                      placeholder="ĐVT"
                                      className="h-9"
                                      readOnly={!!selectedItemId}
                                      disabled={!!selectedItemId}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Quantity */}
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field: qtyField }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      {...qtyField}
                                      onChange={(e) =>
                                        qtyField.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="h-9 text-center"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Unit Cost */}
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitCost`}
                              render={({ field: costField }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      {...costField}
                                      onChange={(e) =>
                                        costField.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="h-9 text-right"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Subtotal (Read-only) */}
                          <TableCell className="p-2 text-right font-medium">
                            <div className="h-9 flex items-center justify-end font-mono text-sm">
                              {formatMoney(subtotal).vndFormatted}
                            </div>
                          </TableCell>

                          {/* Note */}
                          <TableCell className="p-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.note`}
                              render={({ field: noteField }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      {...noteField}
                                      value={noteField.value || ""}
                                      placeholder="Ghi chú..."
                                      className="h-9"
                                    />
                                  </FormControl>
                                  <FormMessage />
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
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* "Add Row" Ghost Row */}
                    <TableRow
                      className="hover:bg-transparent cursor-pointer border-t-2 border-dashed"
                      onClick={addItem}
                    >
                      <TableCell colSpan={9} className="p-2">
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

            <DialogFooter className="px-6 py-4 border-t">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    Tổng cộng:{" "}
                    <span className="font-bold text-foreground ml-1">
                      {fields.length}
                    </span>{" "}
                    mục
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Giá trị dự kiến
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {formatMoney(totalCost).vndFormatted}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
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
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
