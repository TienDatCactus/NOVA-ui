import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "~/components/ui/shadcn-io/dropzone";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { ServiceTypesSchema } from "~/services/api/service-types/service-types.schema";
import { useCreateServiceType } from "../container/service-types/mutation.hooks";

const { CreateServiceTypeRequestSchema } = ServiceTypesSchema;

type CreateServiceTypeFormData = z.infer<typeof CreateServiceTypeRequestSchema>;

interface CreateServiceTypeDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateServiceTypeDialog({
  open,
  onClose,
}: CreateServiceTypeDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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
    createServiceType(
      {
        ...data,
        images: files,
      },
      {
        onSuccess: () => {
          form.reset();
          setFiles([]);
          setPreviews([]);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    setFiles([]);
    setPreviews([]);
    onClose();
  };

  useEffect(() => {
    form.setValue("images", files as any);
  }, [files, form]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const onDropFiles = (accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden gap-0 p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Thêm loại dịch vụ mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho loại dịch vụ mới. Tất cả các trường đánh
            dấu * đều bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mã loại dịch vụ{" "}
                        <span className="text-destructive">*</span>
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
                        Tên loại dịch vụ{" "}
                        <span className="text-destructive">*</span>
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
              </div>

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

              {/* Image Upload with Dropzone */}
              <div className="space-y-3">
                <FormLabel>Hình ảnh</FormLabel>
                <Dropzone
                  accept={{ "image/*": [] }}
                  maxFiles={8}
                  onDrop={onDropFiles}
                  src={files}
                  className="border-2 border-dashed"
                >
                  <DropzoneEmptyState />
                  <DropzoneContent />
                </Dropzone>

                {/* Image Preview */}
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {previews.map((url, index) => (
                      <div key={index} className="relative group border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <Image
                          src={url}
                          width={100}
                          height={100}
                          alt={`Preview ${index + 1}`}
                          className="object-cover "
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          aria-label="Xóa ảnh"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Cho phép PNG, JPG, GIF. Tối đa 8 ảnh.
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
            </form>
          </Form>
        </div>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isPending}
          >
            {isPending ? "Đang thêm..." : "Thêm loại dịch vụ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
