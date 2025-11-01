import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { MenuCategoryService } from "~/services/api/menu-category";
import { UnitsService } from "~/services/api/units";
import { MenuSchema } from "~/services/schema/menu.schema";
import { useUpdateMenuItem } from "../container/menu-mutation.hooks";
import { useMenuItemDetail } from "../container/menu-query.hooks";

const { UpdateMenuItemRequestSchema } = MenuSchema;

type UpdateMenuFormData = z.infer<typeof UpdateMenuItemRequestSchema>;

interface EditMenuSheetProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
}

export default function EditMenuSheet({
  open,
  onClose,
  itemId,
}: EditMenuSheetProps) {
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(UpdateMenuItemRequestSchema),
    defaultValues: {
      CategoryId: "",
      Code: "",
      Name: "",
      Description: "",
      UnitId: "",
      Price: 0,
      Active: true,
      RemoveMediaIds: [],
      NewImages: [],
      Components: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "Components",
  });

  const { data: menuItem, isPending: isLoadingDetail } =
    useMenuItemDetail(itemId);
  const { mutate: updateMenuItem, isPending: isUpdating } =
    useUpdateMenuItem(itemId);
  const { data: categories } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: async () => await MenuCategoryService.getMenuCategoryList(),
  });
  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: async () => await UnitsService.getUnitList(),
  });

  useEffect(() => {
    if (menuItem) {
      form.reset({
        CategoryId: menuItem.categoryId,
        Code: menuItem.code,
        Name: menuItem.name,
        Description: menuItem.description,
        UnitId: menuItem.unitId,
        Price: menuItem.price,
        Active: menuItem.active,
        RemoveMediaIds: [],
        NewImages: [],
        Components: menuItem.components.map((comp) => ({
          itemId: comp.itemId,
          itemCode: comp.itemId, // Using itemId as code fallback
          itemName: comp.itemName,
          quantity: comp.quantity,
          notes: comp.notes || "",
        })),
      });
      setExistingImages(menuItem.imageUrls || []);
      setRemovedImageIds([]);
    }
  }, [menuItem, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentImages = form.getValues("NewImages") || [];
    form.setValue("NewImages", [...currentImages, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreview((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveNewImage = (index: number) => {
    const currentImages = form.getValues("NewImages") || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("NewImages", newImages);

    URL.revokeObjectURL(imagePreview[index]);
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageUrl: string, index: number) => {
    // For now, we'll just remove from display
    // In a real implementation, you'd track the media ID to remove
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    // You would need to get the actual media ID from the backend
    // setRemovedImageIds((prev) => [...prev, mediaId]);
    // form.setValue("RemoveMediaIds", [...removedImageIds, mediaId]);
  };

  const handleSubmit = (data: UpdateMenuFormData) => {
    updateMenuItem(
      { ...data, RemoveMediaIds: removedImageIds },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    imagePreview.forEach((url) => URL.revokeObjectURL(url));
    setImagePreview([]);
    setExistingImages([]);
    setRemovedImageIds([]);
    form.reset();
    onClose();
  };

  if (isLoadingDetail) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[700px] p-0 flex flex-col gap-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>Chỉnh sửa món ăn</SheetTitle>
            <SheetDescription>Đang tải thông tin món ăn...</SheetDescription>
          </SheetHeader>
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[700px] p-0 flex flex-col gap-0 overflow-hidden">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Chỉnh sửa món ăn</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin món ăn. Nhấn lưu khi hoàn tất.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="CategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Danh mục <span className="text-destructive">*</span>
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
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
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
                    name="Code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mã món <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="VD: FOOD001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên món <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Phở bò" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mô tả <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả chi tiết..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="UnitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Đơn vị <span className="text-destructive">*</span>
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
                            {units?.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
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
                          Giá (VNĐ) <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Active"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel>Trạng thái</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <span className="text-sm text-muted-foreground">
                            {field.value ? "Hoạt động" : "Tạm ngưng"}
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Hình ảnh
                </h3>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Hình ảnh hiện tại:
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {existingImages.map((url, index) => (
                        <div
                          key={`existing-${index}`}
                          className="relative group aspect-square rounded-lg overflow-hidden border"
                        >
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveExistingImage(url, index)
                            }
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="new-image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                    >
                      <ImagePlus className="h-4 w-4" />
                      <span>Thêm ảnh mới</span>
                    </label>
                    <input
                      id="new-image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {imagePreview.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {imagePreview.length} ảnh mới
                      </p>
                    )}
                  </div>

                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreview.map((preview, index) => (
                        <div
                          key={`new-${index}`}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-primary"
                        >
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <Badge
                            variant="default"
                            className="absolute bottom-2 left-2 text-xs"
                          >
                            Mới
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Components */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold">Thành phần</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        itemId: "",
                        itemCode: "",
                        itemName: "",
                        quantity: 0,
                        notes: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Chưa có thành phần nào
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name={`Components.${index}.itemName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Tên</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Tên nguyên liệu"
                                      {...field}
                                      className="h-9"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`Components.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Số lượng
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          Number.parseFloat(e.target.value)
                                        )
                                      }
                                      className="h-9"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="mt-6 h-9 w-9 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </Form>
        </div>

        <SheetFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Hủy
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isUpdating}
          >
            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
