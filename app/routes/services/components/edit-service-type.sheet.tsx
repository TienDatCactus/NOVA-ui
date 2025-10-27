import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import type z from "zod";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
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
import { Switch } from "~/components/ui/switch";
import useServiceTypesSchema from "~/services/schema/service-types.schema";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { X, Upload } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { useUpdateServiceType } from "../container/service-type-mutation.hooks";

const { UpdateServiceTypeRequestSchema } = useServiceTypesSchema();

type UpdateServiceTypeFormData = z.infer<typeof UpdateServiceTypeRequestSchema>;

interface EditServiceTypeSheetProps {
  open: boolean;
  onClose: () => void;
  type: ServiceTypeItem | null;
}

export default function EditServiceTypeSheet({
  open,
  onClose,
  type,
}: EditServiceTypeSheetProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const form = useForm<UpdateServiceTypeFormData>({
    resolver: zodResolver(UpdateServiceTypeRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      active: true,
    },
  });

  const { mutate: updateServiceType, isPending } = useUpdateServiceType();

  // Populate form when type changes
  useEffect(() => {
    if (type) {
      form.reset({
        code: type.code,
        name: type.name,
        description: type.description || "",
        active: type.active,
      });
      //   setImageUrls(type.imageUrls || []);
    }
  }, [type, form]);

  const handleSubmit = (data: UpdateServiceTypeFormData) => {
    if (!type) return;

    // TODO: Handle image updates
    updateServiceType(
      { id: type.id, data },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    setImageUrls([]);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUrls = Array.from(files).map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...newUrls]);

    // TODO: Upload to backend
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chỉnh sửa loại dịch vụ</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin cho loại dịch vụ. Nhấn lưu khi hoàn tất.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-6"
          >
            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mã loại dịch vụ <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: SPA, FOOD, DRINK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên loại dịch vụ <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Spa & Massage, Ẩm thực, Đồ uống"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về loại dịch vụ..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Management */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Hình ảnh</label>
              <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <label
                      htmlFor="edit-image-upload"
                      className="cursor-pointer"
                    >
                      <span className="text-sm text-primary hover:underline">
                        Thêm hình ảnh
                      </span>
                      <input
                        id="edit-image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="mr-2">
                  Lưu ý
                </Badge>
                Chức năng upload hình ảnh đang được phát triển.
              </p>
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Trạng thái hoạt động
                    </FormLabel>
                    <FormDescription>
                      Tắt nếu muốn tạm ngừng loại dịch vụ này
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
