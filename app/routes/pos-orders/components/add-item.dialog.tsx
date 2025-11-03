import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn, formatMoney, handleLimitInput } from "~/lib/utils";
import { useMenuCategories } from "~/routes/menu/container/menu-categories/query.hooks";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useAddItemToPOSOrder } from "../container/pos-orders-mutation.hooks";
import { MinusCircle, PlusCircle, Search, ShoppingCart } from "lucide-react";
import type { MenuListItemDto } from "~/services/api/menu/dto";

// Form schema for adding item to POS order
const AddItemFormSchema = z.object({
  menuItemId: z.string().min(1, "Vui lòng chọn món"),
  menuItemName: z.string(),
  quantity: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
  unitPrice: z.number().min(0, "Đơn giá phải lớn hơn hoặc bằng 0"),
});

type AddItemFormData = z.infer<typeof AddItemFormSchema>;

interface AddItemToPOSOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess?: () => void;
}

export default function AddItemToPOSOrderDialog({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: AddItemToPOSOrderDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuListItemDto | null>(
    null
  );

  const { data: categories = [], isPending: categoriesLoading } =
    useMenuCategories({});
  const { data: menuItems = [], isPending: menuLoading } = useMenuList({
    categoryCode: selectedCategory === "all" ? undefined : selectedCategory,
  });
  const addItemMutation = useAddItemToPOSOrder();

  const form = useForm<AddItemFormData>({
    resolver: zodResolver(AddItemFormSchema),
    defaultValues: {
      menuItemId: "",
      menuItemName: "",
      quantity: 1,
      unitPrice: 0,
    },
  });

  // Filter menu items by search
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return menuItems;
    const query = searchQuery.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [menuItems, searchQuery]);

  // Handle item selection
  const handleSelectItem = (item: MenuListItemDto) => {
    setSelectedItem(item);
    form.setValue("menuItemId", item.itemId);
    form.setValue("menuItemName", item.name);
    form.setValue("unitPrice", item.price);
    form.setValue("quantity", 1);
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    const currentQuantity = form.getValues("quantity");
    const newQuantity = Math.max(1, currentQuantity + delta);
    form.setValue("quantity", newQuantity);
  };

  // Handle form submission
  const handleSubmit = async (data: AddItemFormData) => {
    try {
      await addItemMutation.mutateAsync({
        orderId,
        data: {
          menuItemId: data.menuItemId,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
        },
      });
      onSuccess?.();
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error("Add item error:", error);
    }
  };

  // Reset form
  const handleReset = () => {
    form.reset();
    setSelectedItem(null);
    setSearchQuery("");
    setSelectedCategory("all");
  };

  // Calculate subtotal
  const quantity = form.watch("quantity");
  const unitPrice = form.watch("unitPrice");
  const subtotal = quantity * unitPrice;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleReset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-4xl gap-0 p-0">
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle className="text-2xl font-bold">
            Thêm món vào đơn hàng
          </DialogTitle>
          <DialogDescription>
            Chọn món từ menu và điều chỉnh số lượng
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 p-6">
          {/* Left: Menu Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tìm kiếm món</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, mã món..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Tabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                {categoriesLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  categories.map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.code}>
                      {cat.name}
                    </TabsTrigger>
                  ))
                )}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-4">
                <ScrollArea className="h-[400px] rounded-md border">
                  {menuLoading ? (
                    <div className="space-y-2 p-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
                      <div>
                        <ShoppingCart className="mx-auto h-12 w-12 opacity-20" />
                        <p className="mt-2">Không tìm thấy món nào</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {filteredMenuItems.map((item) => (
                        <button
                          key={item.itemId}
                          type="button"
                          onClick={() => handleSelectItem(item)}
                          className={cn(
                            "w-full rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-primary/5",
                            selectedItem?.itemId === item.itemId &&
                              "border-primary bg-primary/10"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{item.name}</p>
                                {!item.active && (
                                  <Badge variant="outline" className="text-xs">
                                    Không hoạt động
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {item.code}
                              </p>
                              {item.description && (
                                <p className="line-clamp-1 text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                {formatMoney(item.price).vndFormatted}
                              </p>
                              {item.unitName && (
                                <p className="text-xs text-muted-foreground">
                                  {item.unitName}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Order Details */}
          <div className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {/* Selected Item Info */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  {selectedItem ? (
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold">{selectedItem.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedItem.code}
                        </p>
                      </div>
                      {selectedItem.imageUrls &&
                        selectedItem.imageUrls.length > 0 && (
                          <img
                            src={selectedItem.imageUrls[0]}
                            alt={selectedItem.name}
                            className="h-32 w-full rounded-md object-cover"
                          />
                        )}
                      {selectedItem.description && (
                        <p className="text-sm text-muted-foreground">
                          {selectedItem.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
                      <div>
                        <ShoppingCart className="mx-auto h-8 w-8 opacity-20" />
                        <p className="mt-2 text-sm">Chọn món từ danh sách</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity Control */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={field.value <= 1}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            onInput={handleLimitInput}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                            className="text-center"
                            min={1}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unit Price */}
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn giá</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          onInput={handleLimitInput}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          min={0}
                          step={1000}
                        />
                      </FormControl>
                      <FormDescription>
                        {formatMoney(field.value).vndFormatted}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subtotal Display */}
                <div className="rounded-lg border bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Thành tiền:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatMoney(subtotal).vndFormatted}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleReset();
                      onOpenChange(false);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={!selectedItem || addItemMutation.isPending}
                  >
                    {addItemMutation.isPending ? "Đang thêm..." : "Thêm món"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
