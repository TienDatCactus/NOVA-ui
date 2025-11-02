import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
import { Label } from "~/components/ui/label";
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
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { ServiceTypesSchema } from "~/services/api/service-types/service-types.schema";
import { useUpdateServiceType } from "../container/service-types/mutation.hooks";
import { useServiceTypeDetails } from "../container/service-types/query.hooks";

const { UpdateServiceTypeRequestSchema } = ServiceTypesSchema;

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
  const { data: serviceTypeDetails } = useServiceTypeDetails(type!.id);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<string[]>([]);
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
  useEffect(() => {
    if (type) {
      form.reset({
        code: type.code,
        name: type.name,
        description: type.description || "",
        active: type.active,
      });
      setRemoveMediaIds([]);
      setNewFiles([]);
      setNewPreviews([]);
    }
  }, [type, form]);

  const handleSubmit = (data: UpdateServiceTypeFormData) => {
    if (!type) return;

    updateServiceType(
      {
        id: type.id,
        data: {
          ...data,
          newImages: newFiles,
          removeMediaIds,
        } as UpdateServiceTypeFormData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    setRemoveMediaIds([]);
    setNewFiles([]);
    setNewPreviews([]);
    onClose();
  };

  useEffect(() => {
    form.setValue("newImages", newFiles as any);
    form.setValue("removeMediaIds", removeMediaIds);
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
      prev.includes(id) ? prev.filter((id) => id !== id) : [...prev, id]
    );
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[600px] p-0 flex flex-col gap-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Chỉnh sửa loại dịch vụ</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin cho loại dịch vụ. Nhấn lưu khi hoàn tất.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4 mt-6"
            >
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

              <div className="space-y-2">
                <FormLabel>Hình ảnh hiện có</FormLabel>
                {serviceTypeDetails?.images?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Không có hình ảnh
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {!!serviceTypeDetails &&
                      serviceTypeDetails.images?.map((img) => {
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
                              <span className="absolute inset-0 bg-destructive/20 flex items-center justify-center text-xs font-semibold text-destructive-foreground">
                                Sẽ xóa
                              </span>
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
                          className="object-cover  border"
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
                  Có thể tải lên tối đa 8 ảnh. Ảnh sẽ được lưu khi bạn nhấn Lưu
                  thay đổi.
                </p>
              </div>

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
            </form>
          </Form>
        </div>
        <SheetFooter className="p-6 pt-4 border-t gap-2">
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
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
