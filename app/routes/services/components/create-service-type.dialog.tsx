import { zodResolver } from "@hookform/resolvers/zod";
import {
  ImagePlus,
  Layers,
  Package,
  Plus,
  RotateCcw,
  Trash2,
  X,
  ScanBarcode,
  Tag,
  AlignLeft,
  ImageIcon,
} from "lucide-react";
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

import { ServiceTypesSchema } from "~/services/api/service-types/service-types.schema";
import { useCreateServiceType } from "../container/service-types/mutation.hooks";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

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
  // --- State ---
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<CreateServiceTypeFormData>({
    resolver: zodResolver(CreateServiceTypeRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      active: true,
    },
  });

  // --- Mutations ---
  const { mutate: createServiceType, isPending } = useCreateServiceType();

  // --- Handlers ---
  const handleSubmit = (data: CreateServiceTypeFormData) => {
    createServiceType(
      { ...data, images: files },
      {
        onSuccess: () => handleClose(),
      }
    );
  };

  const handleClose = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviews([]);
    form.reset();
    setActiveTab("general");
    onClose();
  };

  // Sync files to form (if needed for validation, though usually handled separately for file uploads)
  useEffect(() => {
    form.setValue("images", files as any);
  }, [files, form]);

  // Generate Previews
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const onDropFiles = (accepted: File[]) => {
    const totalFiles = files.length + accepted.length;
    if (totalFiles > 8) {
      form.setError("images", {
        type: "manual",
        message: "Chỉ được tải lên tối đa 8 ảnh",
      });
      return;
    }
    form.clearErrors("images");
    setFiles((prev) => [...prev, ...accepted]);
  };

  const removeImage = (index: number) => {
    form.clearErrors("images");
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-0 p-0 bg-background">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <DialogTitle className="text-xl">Thêm loại dịch vụ</DialogTitle>
            <DialogDescription>
              Định nghĩa nhóm dịch vụ mới (Spa, F&B, Tour...).
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* === TABS === */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="p-2 border-b bg-muted/5 shrink-0">
                <TabsList className="h-12 gap-6 w-full justify-start">
                  <TabsTrigger value="general">
                    <Package className="w-4 h-4 mr-2" /> Thông tin chung
                  </TabsTrigger>
                  <TabsTrigger value="media">
                    <ImageIcon className="w-4 h-4 mr-2" /> Hình ảnh
                    {previews.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 px-1.5 py-0 h-5 text-[10px]"
                      >
                        {previews.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                {/* --- TAB 1: GENERAL --- */}
                <TabsContent
                  value="general"
                  className="mt-0 space-y-6 outline-none"
                >
                  <div className="space-y-4">
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

                    <Separator />

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
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="border-input has-data-[state=checked]:border-primary/50 flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="menu-cate-active"
                                className="scale-75 data-[state=checked]:bg-green-600"
                              />
                              <div className="grid grow gap-2">
                                <FormLabel
                                  className="text-xs font-medium cursor-pointer flex-col items-start mb-0 pb-0"
                                  htmlFor="menu-cate-active"
                                >
                                  <p>{field.value ? "Kích hoạt" : "Nháp"}</p>
                                  <p className="text-muted-foreground text-xs">
                                    Chọn "Tạm ngưng" để ẩn món ăn này khỏi thực
                                    đơn POS.
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

                {/* --- TAB 2: MEDIA (GRID) --- */}
                <TabsContent
                  value="media"
                  className="mt-0 space-y-4 outline-none"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Thư viện ảnh</h4>
                      {form.formState.errors.images?.message && (
                        <p className="text-xs text-destructive font-medium">
                          {form.formState.errors.images.message as string}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {previews.length} / 8 ảnh
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {/* 1. Upload Button */}
                    <Dropzone
                      accept={{ "image/*": [] }}
                      maxFiles={8}
                      onDrop={onDropFiles}
                      src={files}
                      className="group aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className="p-3 rounded-full bg-background shadow-sm border group-hover:scale-110 transition-transform">
                          <ImagePlus className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium">Thêm ảnh</span>
                      </div>
                    </Dropzone>

                    {/* 2. Previews */}
                    {previews.map((url, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-xl overflow-hidden border bg-background shadow-sm animate-in fade-in zoom-in duration-300"
                      >
                        <Image
                          src={url}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
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
                </TabsContent>
              </div>
            </Tabs>

            {/* === FOOTER === */}
            <DialogFooter className="p-6 pt-4 border-t shrink-0 bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Tạo mới
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
