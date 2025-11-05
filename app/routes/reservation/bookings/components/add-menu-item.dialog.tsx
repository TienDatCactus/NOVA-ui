import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import type { AddItemsToPOSOrderRequestDto } from "~/services/api/orders/dto";

const AddMenuItemSchema = z.object({
  menuItemId: z.string().min(1, "Vui lòng chọn món"),
  quantity: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
  unitPrice: z.number().min(0, "Giá phải lớn hơn 0"),
});

type AddMenuItemFormData = z.infer<typeof AddMenuItemSchema>;

interface AddMenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: AddItemsToPOSOrderRequestDto) => void;
  isAdding?: boolean;
}

export default function AddMenuItemDialog({
  open,
  onOpenChange,
  onConfirm,
  isAdding = false,
}: AddMenuItemDialogProps) {
  const { data: menuList, isPending: isLoadingMenu } = useMenuList();

  const form = useForm<AddMenuItemFormData>({
    resolver: zodResolver(AddMenuItemSchema),
    defaultValues: {
      menuItemId: "",
      quantity: 1,
      unitPrice: 0,
    },
  });

  // Auto-fill price when menu item is selected
  const handleMenuItemChange = (menuItemId: string) => {
    const selectedItem = menuList?.find((item) => item.itemId === menuItemId);
    if (selectedItem) {
      form.setValue("unitPrice", selectedItem.price);
    }
  };

  const handleSubmit = (data: AddMenuItemFormData) => {
    onConfirm(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm món vào đơn hàng</DialogTitle>
          <DialogDescription>
            Chọn món từ thực đơn và nhập số lượng
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="menuItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Món ăn</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleMenuItemChange(value);
                    }}
                    value={field.value}
                    disabled={isLoadingMenu}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn món" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {menuList?.map((item) => (
                        <SelectItem key={item.itemId} value={item.itemId}>
                          {item.name} - {item.price.toLocaleString("vi-VN")} ₫
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn giá (₫)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Đang thêm..." : "Thêm món"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
