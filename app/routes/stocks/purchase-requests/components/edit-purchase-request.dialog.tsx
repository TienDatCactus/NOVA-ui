import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { formatMoney } from "~/lib/utils";
import type { UpdatePurchaseRequestDto } from "~/services/api/stocks/purchase-requests/dto";
import { PurchaseRequestsSchemas } from "~/services/api/stocks/purchase-requests/purchase-requests.schema";
import { useStockItemList } from "../../items/container/query.hooks";
import {
  usePurchaseRequestDetail,
  useUpdatePurchaseRequest,
} from "../container/query.hooks";

interface EditPurchaseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequestId: string;
}

export default function EditPurchaseRequestDialog({
  open,
  onOpenChange,
  purchaseRequestId,
}: EditPurchaseRequestDialogProps) {
  const { data: purchaseRequest, isPending: isLoadingPR } =
    usePurchaseRequestDetail(purchaseRequestId);
  const { data: stockItems = [] } = useStockItemList({
    includeInactive: false,
  });

  const { mutate: onSubmit, isPending: isSubmitting } =
    useUpdatePurchaseRequest();

  const form = useForm({
    resolver: zodResolver(PurchaseRequestsSchemas.UpdatePurchaseRequestSchema),
    mode: "onSubmit",
    values: purchaseRequest
      ? {
          notes: purchaseRequest.notes || undefined,
          items: purchaseRequest.items.map((item) => ({
            itemId: item.itemId,
            freeTextItemName: item.freeTextItemName,
            freeTextItemDescription: item.freeTextItemDescription || undefined,
            freeTextUnitName: item.freeTextUnitName || undefined,
            quantity: item.quantity,
            unitCost: item.unitCost,
            note: item.note || undefined,
          })),
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleSubmit = (data: UpdatePurchaseRequestDto) => {
    onSubmit(
      { id: purchaseRequestId, data },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
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

  if (isLoadingPR) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl">
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!purchaseRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Chỉnh sửa yêu cầu mua hàng</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Số phiếu:{" "}
            <Badge variant="outline" className="font-mono">
              {purchaseRequest.requestNumber}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form
              id="edit-purchase-request-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Global Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú chung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ví dụ: Cần mua gấp cho sự kiện cuối tháng..."
                        className="resize-none"
                        rows={2}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Danh sách hàng hóa ({fields.length})
                  </h3>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addItem}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Thêm dòng
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
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
                        <TableHead className="w-[200px]">Ghi chú</TableHead>
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
                          <TableRow key={field.id} className="group">
                            {/* Item Selection */}
                            <TableCell className="align-top pt-3">
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
                                                ) &&
                                              itemField.value !== item.id;
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
                            <TableCell className="align-top pt-3">
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
                                        readOnly={!!selectedItemId}
                                        disabled={!!selectedItemId}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>

                            {/* Unit */}
                            <TableCell className="align-top pt-3">
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
                            <TableCell className="align-top pt-3">
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
                            <TableCell className="align-top pt-3">
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

                            <TableCell className="align-top pt-3 text-right font-medium">
                              <div className="h-9 flex items-center justify-end">
                                {formatMoney(subtotal).vndFormatted}
                              </div>
                            </TableCell>

                            <TableCell className="align-top pt-3">
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
                            <TableCell className="align-top pt-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => remove(index)}
                                      disabled={fields.length === 1}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Xóa dòng</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Add Button Footer */}
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Thêm hàng hóa mới
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex items-center justify-between w-full sm:justify-between">
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs text-muted-foreground">
              Tổng giá trị dự kiến
            </span>
            <span className="text-xl font-bold text-primary">
              {formatMoney(totalCost).vndFormatted}
            </span>
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
              form="edit-purchase-request-form"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cập nhật
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
