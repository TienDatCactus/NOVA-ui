import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Layers,
  Package,
  ImagePlus,
  ScanBarcode,
  Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type z from "zod";

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
import Image from "~/components/ui/image";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "~/components/ui/shadcn-io/dropzone";

import { useUnits } from "~/routes/units/container/unit-query.hooks";
import { MenuSchema } from "~/services/api/menu/menu.schema";
import { useMenuCategories } from "../container/menu-categories/query.hooks";
import { useCreateMenuItem } from "../container/menu/mutation.hooks";
import { useStockItemList } from "~/routes/stocks/items/container/query.hooks";
import { cn } from "~/lib/utils";

const { CreateMenuItemRequestSchema } = MenuSchema;
type CreateMenuFormData = z.infer<typeof CreateMenuItemRequestSchema>;

interface CreateMenuDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateMenuDialog({
  open,
  onClose,
}: CreateMenuDialogProps) {
  // --- State ---
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<CreateMenuFormData>({
    resolver: zodResolver(CreateMenuItemRequestSchema) as any,
    defaultValues: {
      CategoryId: "",
      Code: "",
      Name: "",
      Description: "",
      UnitId: "",
      Price: 0,
      Active: true,
      Images: [],
      Components: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "Components",
  });

  // --- Queries ---
  const { mutate: createMenuItem, isPending } = useCreateMenuItem();
  const { data: categories } = useMenuCategories();
  const { data: units } = useUnits();
  const { data: stockItems } = useStockItemList({ includeInactive: false });

  // --- Handlers ---
  // Sync file input to form
  const currentImages = form.watch("Images");

  const onDropFiles = (files: File[]) => {
    const validFiles = Array.from(files);
    if (validFiles.length === 0) return;

    const currentImages = form.getValues("Images") || [];
    const remainingSlots = 8 - currentImages.length;

    if (remainingSlots <= 0) {
      form.setError("Images", {
        type: "manual",
        message: "Chỉ được tải lên tối đa 8 ảnh",
      });
      return;
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);
    const newImages = [...currentImages, ...filesToAdd];
    form.setValue("Images", newImages);
    form.clearErrors("Images");

    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
    setImagePreview((prev) => [...prev, ...newPreviews]);

    if (validFiles.length > remainingSlots) {
      form.setError("Images", {
        type: "manual",
        message: `Chỉ thêm được ${remainingSlots} ảnh. Đã bỏ qua ${validFiles.length - remainingSlots} ảnh.`,
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImgs = form.getValues("Images") || [];
    const newImgs = currentImgs.filter((_, i) => i !== index);
    form.setValue("Images", newImgs);
    form.clearErrors("Images");

    URL.revokeObjectURL(imagePreview[index]);
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: CreateMenuFormData) => {
    createMenuItem(data, { onSuccess: handleClose });
  };

  const handleClose = () => {
    imagePreview.forEach((url) => URL.revokeObjectURL(url));
    setImagePreview([]);
    form.reset();
    setActiveTab("general");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col gap-0 p-0 bg-background">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* === HEADER === */}
            <DialogHeader className="px-6 py-4 border-b shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DialogTitle className="text-xl">Thêm món mới</DialogTitle>
                  <DialogDescription>
                    Khai báo thông tin món ăn vào hệ thống thực đơn.
                  </DialogDescription>
                </div>

                {/* Active Toggle */}
                <FormField
                  control={form.control}
                  name="Active"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-y-0 gap-2 bg-muted/50 px-3 py-1.5 rounded-full border">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75"
                        />
                      </FormControl>
                      <FormLabel className="text-xs font-medium cursor-pointer mb-0 pb-0">
                        {field.value ? "Kích hoạt ngay" : "Lưu nháp"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </DialogHeader>

            {/* === TABS === */}
            <div className="flex-1 flex flex-col min-h-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col min-h-0"
              >
                <TabsList className="h-12 gap-6 w-full">
                  <TabsTrigger value="general">
                    <Package className="w-4 h-4 mr-2" /> Thông tin chung
                  </TabsTrigger>
                  <TabsTrigger value="media">
                    <ImageIcon className="w-4 h-4 mr-2" /> Hình ảnh
                    {imagePreview.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 px-1.5 py-0 h-5 text-[10px]"
                      >
                        {imagePreview.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="components">
                    <Layers className="w-4 h-4 mr-2" /> Định lượng
                    {fields.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 px-1.5 py-0 h-5 text-[10px]"
                      >
                        {fields.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  <div className="p-6">
                    {/* --- TAB 1: GENERAL --- */}
                    <TabsContent
                      value="general"
                      className="mt-0 space-y-6 outline-none"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="Name"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>
                                Tên món ăn{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="font-medium text-lg"
                                  placeholder="Ví dụ: Cơm Chiên Dương Châu"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="Code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Mã SKU{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  startAddon={
                                    <ScanBarcode className=" h-4 w-4 text-muted-foreground" />
                                  }
                                  className="pl-8 font-mono uppercase"
                                  placeholder="FOOD-NEW"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.value.toUpperCase())
                                  }
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Chỉ chứa chữ IN HOA, số, gạch ngang (-) và gạch
                                dưới (_)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="CategoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Danh mục{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.name}
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
                          name="Price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Giá bán{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="font-semibold text-right"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || val === "-") {
                                      field.onChange(0);
                                    } else {
                                      const numVal = parseInt(val, 10);
                                      if (!isNaN(numVal)) {
                                        field.onChange(numVal);
                                      }
                                    }
                                  }}
                                  onBlur={field.onBlur}
                                  min={0}
                                  step={1000}
                                  startAddon={
                                    <span className="text-muted-foreground text-xs font-bold">
                                      VND
                                    </span>
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="UnitId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Đơn vị tính{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn đơn vị" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {units?.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                      {u.name}
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
                          name="Description"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Mô tả</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Mô tả chi tiết món ăn..."
                                  className="min-h-[100px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* --- TAB 2: MEDIA (GRID LAYOUT) --- */}
                    <TabsContent
                      value="media"
                      className="mt-0 h-full flex flex-col outline-none"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Thư viện ảnh</h4>
                          <span className="text-xs text-muted-foreground">
                            {imagePreview.length} / 8 ảnh
                          </span>
                        </div>

                        {form.formState.errors.Images && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.Images.message}
                          </p>
                        )}

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {/* 1. Upload Button (Always First) */}
                          <Dropzone
                            accept={{ "image/*": [] }}
                            maxFiles={8}
                            onDrop={onDropFiles}
                            className="group aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5"
                          >
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                              <div className="p-3 rounded-full bg-background shadow-sm border group-hover:scale-110 transition-transform">
                                <ImagePlus className="w-6 h-6" />
                              </div>
                              <span className="text-xs font-medium">
                                Thêm ảnh
                              </span>
                            </div>
                          </Dropzone>

                          {/* 2. Previews */}
                          {imagePreview.map((url, index) => (
                            <div
                              key={index}
                              className="group relative aspect-square rounded-xl overflow-hidden border bg-background shadow-sm animate-in fade-in zoom-in duration-300"
                            >
                              <Image
                                src={url}
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <Badge className="absolute bottom-1.5 left-1.5 h-5 px-1.5 text-[10px] bg-white/90 text-foreground hover:bg-white">
                                {index + 1}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* --- TAB 3: COMPONENTS (TABLE LAYOUT) --- */}
                    <TabsContent
                      value="components"
                      className="mt-0 outline-none"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">
                            Công thức định lượng
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Trừ kho tự động khi bán món này.
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            append({
                              itemId: "",
                              itemCode: "",
                              itemName: "",
                              quantity: 1,
                              notes: "",
                            })
                          }
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> Thêm dòng
                        </Button>
                      </div>

                      {fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-muted/5">
                          <Layers className="w-10 h-10 text-muted-foreground/20 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Chưa có nguyên liệu nào
                          </p>
                          <Button
                            variant="link"
                            onClick={() =>
                              append({
                                itemId: "",
                                itemCode: "",
                                itemName: "",
                                quantity: 1,
                                notes: "",
                              })
                            }
                          >
                            Thêm nguyên liệu đầu tiên
                          </Button>
                        </div>
                      ) : (
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/30 text-muted-foreground font-medium">
                              <tr>
                                <th className="text-left py-3 px-4 font-medium w-[50%]">
                                  Nguyên liệu
                                </th>
                                <th className="text-left py-3 px-4 font-medium w-[20%]">
                                  Số lượng
                                </th>
                                <th className="text-left py-3 px-4 font-medium w-[20%]">
                                  Ghi chú
                                </th>
                                <th className="w-[10%]"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {fields.map((field, index) => (
                                <tr
                                  key={field.id}
                                  className="group bg-background hover:bg-muted/5"
                                >
                                  <td className="p-3 pl-4">
                                    <FormField
                                      control={form.control}
                                      name={`Components.${index}.itemId`}
                                      render={({ field }) => (
                                        <FormItem className="space-y-0">
                                          <Select
                                            onValueChange={(val) => {
                                              field.onChange(val);
                                              const item = stockItems?.find(
                                                (i) => i.id === val
                                              );
                                              if (item) {
                                                form.setValue(
                                                  `Components.${index}.itemCode`,
                                                  item.code
                                                );
                                                form.setValue(
                                                  `Components.${index}.itemName`,
                                                  item.name
                                                );
                                              }
                                            }}
                                            value={field.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger className="h-9 border-transparent bg-transparent hover:bg-muted/10 focus:bg-background focus:border-input">
                                                <SelectValue placeholder="Chọn nguyên liệu" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {stockItems?.map((item) => (
                                                <SelectItem
                                                  key={item.id}
                                                  value={item.id}
                                                >
                                                  <div className="flex items-center justify-between w-full gap-2">
                                                    <span>{item.name}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                      {item.unitName}
                                                    </span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </td>
                                  <td className="p-3">
                                    <FormField
                                      control={form.control}
                                      name={`Components.${index}.quantity`}
                                      render={({ field }) => (
                                        <FormItem className="space-y-0">
                                          <FormControl>
                                            <Input
                                              type="number"
                                              value={field.value || ""}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "" || val === "-") {
                                                  field.onChange(0);
                                                } else {
                                                  const numVal =
                                                    parseFloat(val);
                                                  if (
                                                    !isNaN(numVal) &&
                                                    numVal >= 0
                                                  ) {
                                                    field.onChange(numVal);
                                                  }
                                                }
                                              }}
                                              onBlur={field.onBlur}
                                              min={0}
                                              step={0.1}
                                              className="h-9 border-transparent bg-transparent hover:bg-muted/10 focus:bg-background focus:border-input text-right"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </td>
                                  <td className="p-3">
                                    <FormField
                                      control={form.control}
                                      name={`Components.${index}.notes`}
                                      render={({ field }) => (
                                        <FormItem className="space-y-0">
                                          <FormControl>
                                            <Input
                                              placeholder="..."
                                              value={field.value || ""}
                                              onChange={(e) =>
                                                field.onChange(
                                                  e.target.value || ""
                                                )
                                              }
                                              onBlur={field.onBlur}
                                              className="h-9 border-transparent bg-transparent hover:bg-muted/10 focus:bg-background focus:border-input"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </div>

            {/* === FOOTER === */}
            <DialogFooter className="p-6 pt-4 border-t shrink-0">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                type="button"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />{" "}
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Tạo món
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
