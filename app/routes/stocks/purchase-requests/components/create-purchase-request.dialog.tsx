import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useCreatePurchaseRequest } from "../container/query.hooks";
import { PurchaseRequestsSchemas } from "~/services/api/stocks/purchase-requests/purchase-requests.schema";
import type { CreatePurchaseRequestDto } from "~/services/api/stocks/purchase-requests/dto";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useStockItemList } from "../../items/container/query.hooks";
import { Badge } from "~/components/ui/badge";

interface CreatePurchaseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePurchaseRequestDialog({
  open,
  onOpenChange,
}: CreatePurchaseRequestDialogProps) {
  const { data: stockItems = [] } = useStockItemList({
    includeInactive: false,
  });

  const { mutate: onSubmit, isPending: isSubmitting } =
    useCreatePurchaseRequest();

  const form = useForm<CreatePurchaseRequestDto>({
    resolver: zodResolver(PurchaseRequestsSchemas.CreatePurchaseRequestSchema),
    defaultValues: {
      notes: "",
      items: [
        {
          itemId: "",
          freeTextItemName: "",
          freeTextItemDescription: "",
          freeTextUnitName: "",
          quantity: 1,
          unitCost: 0,
          note: "",
        },
      ],
    },
  });

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
      itemId: "",
      freeTextItemName: "",
      freeTextItemDescription: "",
      freeTextUnitName: "",
      quantity: 1,
      unitCost: 0,
      note: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-2">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Tạo yêu cầu mua hàng</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo yêu cầu mua hàng mới
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 overflow-y-auto max-h-[70vh] px-4 pb-4"
          >
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú cho yêu cầu mua hàng..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Items List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Danh sách hàng hóa</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm hàng hóa
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Hàng hóa #{index + 1}</Badge>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Item Select */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.itemId`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>Chọn hàng hóa từ danh sách</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                itemField.onChange(value || null);
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
                              }}
                              value={itemField.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn hoặc nhập tự do" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">
                                  <em>Nhập tự do</em>
                                </SelectItem>
                                {stockItems.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.code} - {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Free Text Name */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.freeTextItemName`}
                        render={({ field: nameField }) => (
                          <FormItem>
                            <FormLabel>
                              Tên hàng hóa
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập tên hàng hóa"
                                {...nameField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Free Text Description */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.freeTextItemDescription`}
                        render={({ field: descField }) => (
                          <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                              <Input placeholder="Mô tả..." {...descField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Free Text Unit */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.freeTextUnitName`}
                        render={({ field: unitField }) => (
                          <FormItem>
                            <FormLabel>Đơn vị tính</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="VD: Thùng, kg..."
                                {...unitField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Quantity */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field: qtyField }) => (
                          <FormItem>
                            <FormLabel>
                              Số lượng
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...qtyField}
                                onChange={(e) =>
                                  qtyField.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Unit Cost */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitCost`}
                        render={({ field: costField }) => (
                          <FormItem>
                            <FormLabel>
                              Giá dự kiến (đơn vị)
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...costField}
                                onChange={(e) =>
                                  costField.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Item Note */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.note`}
                      render={({ field: noteField }) => (
                        <FormItem>
                          <FormLabel>Ghi chú cho hàng hóa này</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ghi chú..."
                              className="resize-none"
                              rows={2}
                              {...noteField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </Form>

        <DialogFooter className="px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Tạo yêu cầu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
