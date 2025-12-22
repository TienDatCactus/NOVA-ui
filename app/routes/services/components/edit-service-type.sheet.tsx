import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlignLeft,
  ImageIcon,
  ImagePlus,
  Package,
  RotateCcw,
  Save,
  ScanBarcode,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import { ScrollArea } from "~/components/ui/scroll-area";
import { Dropzone } from "~/components/ui/shadcn-io/dropzone";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
  // --- State & Hooks ---
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<UpdateServiceTypeFormData>({
    resolver: zodResolver(UpdateServiceTypeRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      active: true,
    },
  });

  // --- Queries ---
  const { data: serviceTypeDetails } = useServiceTypeDetails(type?.id || "", {
    enabled: open && !!type,
  });

  const { mutate: updateServiceType, isPending: isUpdating } =
    useUpdateServiceType(type?.id || "");

  // --- Effects ---
  useEffect(() => {
    if (type && serviceTypeDetails) {
      form.reset({
        code: serviceTypeDetails.code,
        name: serviceTypeDetails.name,
        description: serviceTypeDetails.description || "",
        active: serviceTypeDetails.active,
      });
      setRemoveMediaIds([]);
      setNewFiles([]);
      setNewPreviews([]);
    }
  }, [type, serviceTypeDetails, form]);

  useEffect(() => {
    form.setValue("newImages", newFiles as any);
    form.setValue("removeMediaIds", removeMediaIds);
  }, [newFiles, removeMediaIds, form]);

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  // --- Handlers ---
  const handleSubmit = (data: UpdateServiceTypeFormData) => {
    if (!type) return;
    updateServiceType(
      {
        data: {
          ...data,
          newImages: newFiles,
          removeMediaIds,
        } as UpdateServiceTypeFormData,
      },
      { onSuccess: handleClose }
    );
  };

  const handleClose = () => {
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewPreviews([]);
    setNewFiles([]);
    setRemoveMediaIds([]);
    setActiveTab("general");
    form.reset();
    onClose();
  };

  const toggleRemoveExisting = (id: string) => {
    setRemoveMediaIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const removeNewFile = (index: number) => {
    form.clearErrors("newImages");
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto p-0 flex flex-col gap-0 ">
        {/* === HEADER === */}
        <SheetHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <SheetTitle className="text-xl ">Chỉnh sửa loại dịch vụ</SheetTitle>
            <SheetDescription>
              Cập nhật thông tin cho{" "}
              <span className="font-semibold text-foreground">
                {type?.name}
              </span>
              .
            </SheetDescription>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex-1 flex flex-col "
          >
            {/* === TABS === */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="border-b  shrink-0">
                <TabsList className="  h-12 w-full justify-start">
                  <TabsTrigger value="general">
                    <Package className="w-4 h-4 mr-2" /> Thông tin chung
                  </TabsTrigger>
                  <TabsTrigger value="media">
                    <ImageIcon className="w-4 h-4 mr-2" /> Hình ảnh
                    {(serviceTypeDetails?.images?.length || 0) +
                      newFiles.length >
                      0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 px-1.5 py-0 h-5 text-[10px]"
                      >
                        {(serviceTypeDetails?.images?.length || 0) +
                          newFiles.length -
                          removeMediaIds.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  <TabsContent
                    value="general"
                    className="mt-0 space-y-6 outline-none"
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                                <div className="relative">
                                  <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-9 text-lg font-medium"
                                    placeholder="VD: Spa & Massage"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Mã định danh{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <ScanBarcode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-9 font-mono uppercase"
                                    placeholder="VD: SPA"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                Mã viết tắt dùng để quản lý hệ thống (VD: SPA,
                                FOOD).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <AlignLeft className="w-4 h-4" /> Mô tả
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Mô tả chi tiết về nhóm dịch vụ này..."
                                className="min-h-[120px] resize-none"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Active Toggle */}
                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="scale-75"
                                  id="service-type-active-switch"
                                />
                                <div className="grid grow gap-2">
                                  <FormLabel
                                    className="text-xs font-medium cursor-pointer flex-col items-start mb-0 pb-0"
                                    htmlFor="service-type-active-switch"
                                  >
                                    <p>
                                      {field.value
                                        ? "Đang hoạt động"
                                        : "Ngưng hoạt động"}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      Chọn "Ngưng hoạt động" để ẩn loại dịch vụ
                                      này khỏi hệ thống.
                                    </p>
                                  </FormLabel>
                                </div>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* --- TAB 2: MEDIA --- */}
                  <TabsContent
                    value="media"
                    className="mt-0 space-y-4 outline-none"
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Thư viện ảnh</h4>
                        {form.formState.errors.newImages?.message && (
                          <p className="text-xs text-destructive font-medium">
                            {form.formState.errors.newImages.message as string}
                          </p>
                        )}
                        {!form.formState.errors.newImages?.message && (
                          <p className="text-xs text-muted-foreground">
                            Kéo thả hoặc nhấn vào ô dấu cộng để thêm ảnh. Tối đa
                            8 ảnh.
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="h-6">
                        {(serviceTypeDetails?.images?.length || 0) +
                          newFiles.length -
                          removeMediaIds.length}{" "}
                        / 8
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {/* 1. Upload Button */}
                      <Dropzone
                        accept={{ "image/*": [] }}
                        maxFiles={8}
                        onDrop={(accepted) => {
                          const currentTotal =
                            (serviceTypeDetails?.images?.length || 0) +
                            newFiles.length -
                            removeMediaIds.length;
                          const totalAfter = currentTotal + accepted.length;
                          if (totalAfter > 8) {
                            form.setError("newImages", {
                              type: "manual",
                              message: "Chỉ được tải lên tối đa 8 ảnh",
                            });
                            return;
                          }
                          form.clearErrors("newImages");
                          setNewFiles((prev) => [...prev, ...accepted]);
                        }}
                        className="group aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5"
                      >
                        <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                          <div className="p-3 rounded-full bg-background shadow-sm border group-hover:scale-110 transition-transform">
                            <ImagePlus className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-medium">Thêm ảnh</span>
                        </div>
                      </Dropzone>

                      {/* 2. New Previews */}
                      {newPreviews.map((url, index) => (
                        <div
                          key={`new-${index}`}
                          className="group relative aspect-square rounded-xl overflow-hidden border bg-background shadow-sm animate-in fade-in zoom-in duration-300"
                        >
                          <Image
                            src={url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewFile(index)}
                            className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <Badge className="absolute bottom-1.5 left-1.5 h-5 px-1.5 text-[10px] bg-blue-600 text-white hover:bg-blue-700 border-none">
                            Mới
                          </Badge>
                        </div>
                      ))}

                      {/* 3. Existing Images */}
                      {serviceTypeDetails?.images?.map((img) => {
                        const isRemoved = removeMediaIds.includes(img.mediaId);
                        return (
                          <div
                            key={img.mediaId}
                            className={cn(
                              "group relative aspect-square rounded-xl overflow-hidden border bg-background transition-all",
                              isRemoved
                                ? "opacity-50 grayscale border-destructive/50"
                                : "hover:border-primary/50 hover:shadow-sm"
                            )}
                          >
                            <Image
                              src={img.url}
                              alt="Existing"
                              className="w-full h-full object-cover"
                            />

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                variant={
                                  isRemoved ? "secondary" : "destructive"
                                }
                                size="sm"
                                className="h-8 px-3 rounded-full shadow-lg"
                                onClick={() =>
                                  toggleRemoveExisting(img.mediaId)
                                }
                              >
                                {isRemoved ? (
                                  <>
                                    <RotateCcw className="w-3 h-3 mr-1.5" />{" "}
                                    Phục hồi
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3 mr-1.5" /> Xóa
                                    ảnh
                                  </>
                                )}
                              </Button>
                            </div>

                            {isRemoved && (
                              <div className="absolute top-2 right-2 bg-destructive text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                                Sẽ xóa
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>

            {/* === FOOTER === */}
            <SheetFooter className="p-6 pt-4 border-t shrink-0 bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="min-w-[140px]"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
