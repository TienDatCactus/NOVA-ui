import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
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
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import useServiceTypesSchema from "~/services/schema/service-types.schema";
import { X, Upload } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { useCreateServiceType } from "../container/service-type-mutation.hooks";

const { CreateServiceTypeRequestSchema } = useServiceTypesSchema();

type CreateServiceTypeFormData = z.infer<typeof CreateServiceTypeRequestSchema>;

interface CreateServiceTypeDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateServiceTypeDialog({
  open,
  onClose,
}: CreateServiceTypeDialogProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const form = useForm<CreateServiceTypeFormData>({
    resolver: zodResolver(CreateServiceTypeRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      active: true,
    },
  });

  const { mutate: createServiceType, isPending } = useCreateServiceType();

  const handleSubmit = (data: CreateServiceTypeFormData) => {
    createServiceType(data, {
      onSuccess: () => {
        form.reset();
        setImageUrls([]);
        onClose();
      },
    });
  };

  const handleClose = () => {
    form.reset();
    setImageUrls([]);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Preview images (local URLs)
    const newUrls = Array.from(files).map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...newUrls]);

    // TODO: Upload to backend and get real URLs
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm loại dịch vụ mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho loại dịch vụ mới. Tất cả các trường đánh
            dấu * đều bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
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
                  <FormDescription>
                    Mã duy nhất để nhận diện loại dịch vụ
                  </FormDescription>
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

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Hình ảnh</label>
              <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-sm text-primary hover:underline">
                        Chọn file
                      </span>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF tối đa 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
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
                Chức năng upload hình ảnh đang được phát triển. Hình ảnh sẽ được
                lưu sau khi backend hoàn thiện API.
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
                      Bật để loại dịch vụ có thể được sử dụng ngay
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang thêm..." : "Thêm loại dịch vụ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
