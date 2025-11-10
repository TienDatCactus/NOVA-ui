import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "~/components/ui/shadcn-io/dropzone";
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
import { cn, handleLimitInput } from "~/lib/utils";
import { useMenuCategories } from "../container/menu-categories/query.hooks";
import { useUpdateMenuItem } from "../container/menu/mutation.hooks";
import { useMenuItemDetail } from "../container/menu/query.hooks";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import { MenuSchema } from "~/services/api/menu/menu.schema";
import Image from "~/components/ui/image";

const { UpdateMenuItemRequestSchema } = MenuSchema;

type UpdateMenuFormData = z.infer<typeof UpdateMenuItemRequestSchema>;

interface EditMenuSheetProps {
  open: boolean;
  onClose: () => void;
  menuItem: MenuListItemDto;
}

export default function EditMenuSheet({
  open,
  onClose,
  menuItem,
}: EditMenuSheetProps) {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<string[]>([]);

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "Components",
  });

  const { data: menuItemDetail, isPending: isLoadingDetail } =
    useMenuItemDetail(menuItem.itemId, { enabled: open });

  const { mutate: updateMenuItem, isPending: isUpdating } = useUpdateMenuItem(
    menuItem.itemId
  );
  const { data: menuCategories } = useMenuCategories();
  const { data: units } = useUnits();

  useEffect(() => {
    if (menuItem) {
      form.reset({
        CategoryId: menuItemDetail?.categoryId,
        Code: menuItemDetail?.code,
        Name: menuItemDetail?.name,
        Description: menuItemDetail?.description,
        UnitId: menuItemDetail?.unitId || "",
        Price: menuItemDetail?.price,
        Active: menuItemDetail?.active,
        RemoveMediaIds: [],
        NewImages: [],
        Components: menuItemDetail?.components.map((comp) => ({
          itemId: comp.itemId,
          itemCode: menuItem.code,
          itemName: comp.itemName,
          quantity: comp.quantity,
          notes: comp.notes || "",
        })),
      });

      setRemoveMediaIds([]);
      setNewFiles([]);
      setNewPreviews([]);
    }
  }, [menuItem, form, menuItemDetail]);

  const handleSubmit = (data: UpdateMenuFormData) => {
    updateMenuItem(
      {
        ...data,
        RemoveMediaIds: removeMediaIds,
        NewImages: newFiles,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewPreviews([]);
    setNewFiles([]);
    setRemoveMediaIds([]);
    form.reset();
    onClose();
  };

  useEffect(() => {
    form.setValue("NewImages", newFiles as any);
    form.setValue("RemoveMediaIds", removeMediaIds);
  }, [newFiles, removeMediaIds, form]);

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [newFiles]);

  const onDropNewFiles = (accepted: File[]) => {
    setNewFiles((prev) => [...prev, ...accepted]);
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRemoveExisting = (id: string) => {
    setRemoveMediaIds((prev) =>
      prev.includes(id)
        ? prev.filter((mediaId) => mediaId !== id)
        : [...prev, id]
    );
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {menuCategories?.map((category) => (
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
                </div>
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
                            <SelectTrigger className="w-full">
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
                            onInput={handleLimitInput}
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
                        <FormLabel>
                          <span className="text-sm text-muted-foreground">
                            {field.value ? "Hoạt động" : "Tạm ngưng"}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <div className="flex grow items-center gap-3">
                                <div className="grid grow gap-2">
                                  <FormLabel htmlFor={field.name}>
                                    Kích hoạt món ăn
                                  </FormLabel>
                                  <p
                                    id={field.name}
                                    className="text-muted-foreground text-xs"
                                  >
                                    Cho phép món ăn hiển thị trong thực đơn
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
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
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Hình ảnh
                </h3>

                {/* Existing Images */}
                <div className="space-y-2">
                  <FormLabel>Hình ảnh hiện có</FormLabel>
                  {!menuItemDetail || menuItemDetail?.images?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Không có hình ảnh
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {menuItemDetail.images?.map((img) => {
                        const marked = removeMediaIds.includes(img.mediaId);
                        return (
                          <Label
                            key={img.mediaId}
                            className={cn(
                              "relative group rounded-md border cursor-pointer transition-all",
                              {
                                "ring-2 ring-destructive/60 border-destructive/50":
                                  marked,
                                "border-border hover:border-primary/30":
                                  !marked,
                              }
                            )}
                            title={
                              marked ? "Bỏ đánh dấu xóa" : "Đánh dấu để xóa"
                            }
                          >
                            <div className="absolute top-2 left-2 z-10">
                              <Checkbox
                                className="
                                data-[state=checked]:bg-destructive border-destructive data-[state=checked]:border-destructive"
                                checked={marked}
                                onCheckedChange={() =>
                                  toggleRemoveExisting(img.mediaId)
                                }
                              />
                            </div>
                            <Image
                              src={img.url}
                              alt="existing"
                              width={100}
                              height={100}
                              className="object-cover rounded-md"
                            />

                            {marked && (
                              <span className="absolute inset-0 bg-destructive/20 flex items-center justify-center text-xs font-semibold" />
                            )}
                          </Label>
                        );
                      })}
                    </div>
                  )}
                  {removeMediaIds.length > 0 && (
                    <p className="text-xs text-destructive">
                      Đã đánh dấu xóa {removeMediaIds.length} ảnh
                    </p>
                  )}
                </div>

                {/* New Images Upload */}
                <div className="space-y-2">
                  <FormLabel>Thêm hình ảnh</FormLabel>
                  <Dropzone
                    accept={{ "image/*": [] }}
                    maxFiles={8}
                    onDrop={(accepted) => onDropNewFiles(accepted)}
                    src={newFiles}
                    className="border-2 border-dashed"
                  >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>

                  {newPreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newPreviews.map((url, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={url}
                            alt={`new-${index}`}
                            width={100}
                            height={100}
                            className="object-cover border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeNewFile(index)}
                            aria-label="Xóa ảnh mới"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Có thể tải lên tối đa 8 ảnh. Ảnh sẽ được lưu khi bạn nhấn
                    Lưu thay đổi.
                  </p>
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
                                      onInput={handleLimitInput}
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
