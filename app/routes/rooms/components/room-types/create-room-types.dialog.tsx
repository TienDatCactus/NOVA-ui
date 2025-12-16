import {
  BedDouble,
  DollarSign,
  FileText,
  ImageIcon,
  Package,
  ScanBarcode,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import Image from "~/components/ui/image";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Dropzone } from "~/components/ui/shadcn-io/dropzone";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { RoomTypesSchema } from "~/services/api/room-types/room-types.schema";
import { useCreateRoomType } from "../../container/room-types/mutation.hooks";

const { CreateRoomTypesRequestSchema } = RoomTypesSchema;
type CreateRoomTypeFormData = z.infer<typeof CreateRoomTypesRequestSchema>;

interface CreateRoomTypeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateRoomTypeDialog({
  open,
  onClose,
}: CreateRoomTypeDialogProps) {
  // --- State ---
  const [activeTab, setActiveTab] = useState("general");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const { mutate: createRoomType, isPending } = useCreateRoomType();

  const form = useForm<CreateRoomTypeFormData>({
    resolver: zodResolver(CreateRoomTypesRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      baseRate: undefined as any,
      maxOccupancy: 2,
      active: true,
      images: [],
    },
  });

  const handleSubmit = (data: CreateRoomTypeFormData) => {
    createRoomType(
      { ...data, images: newFiles },
      {
        onSuccess: () => {
          toast.success("Tạo hạng phòng thành công");
          handleClose();
        },
        onError: () => {
          toast.error("Tạo hạng phòng thất bại");
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    setNewFiles([]);
    setPreviews([]);
    setActiveTab("general");
    onClose();
  };

  // --- Effects ---
  useEffect(() => {
    if (!open) {
      setNewFiles([]);
      setPreviews([]);
      setActiveTab("general");
    }
  }, [open]);

  useEffect(() => {
    form.setValue("images", newFiles as any);
  }, [newFiles, form]);

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  // --- Handlers ---
  const onDropNewFiles = (accepted: File[]) => {
    const totalFiles = newFiles.length + accepted.length;
    if (totalFiles > 8) {
      form.setError("images", {
        type: "manual",
        message: "Chỉ được tải lên tối đa 8 ảnh",
      });
      return;
    }
    form.clearErrors("images");
    setNewFiles((prev) => [...prev, ...accepted]);
  };

  const removeNewFile = (index: number) => {
    form.clearErrors("images");
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh] flex flex-col gap-0 p-0 ">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b  flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <DialogTitle className="text-xl flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-primary" />
              Thêm hạng phòng
            </DialogTitle>
            <DialogDescription>
              Thiết lập thông tin cho loại phòng mới.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex-1 flex flex-col"
          >
            {/* === TABS === */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="border-b bg-muted/5 shrink-0">
                <TabsList className="p-0 h-12 gap-6 w-full justify-start">
                  <TabsTrigger value="general">
                    <Package className="w-4 h-4 mr-2" /> Thông tin chung
                  </TabsTrigger>
                  <TabsTrigger value="description">
                    <FileText className="w-4 h-4 mr-2" /> Mô tả
                  </TabsTrigger>
                  <TabsTrigger value="media">
                    <ImageIcon className="w-4 h-4 mr-2" /> Hình ảnh
                    {newFiles.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 px-1.5 py-0 h-5 text-[10px]"
                      >
                        {newFiles.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
                  {/* --- TAB 1: GENERAL --- */}
                  <TabsContent
                    value="general"
                    className="mt-0 space-y-6 outline-none"
                  >
                    <div className="grid grid-cols-2 gap-4 items-start">
                      {/* Name & Code */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Tên hạng phòng{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="text-lg font-medium"
                                placeholder="VD: Deluxe Ocean View"
                                {...field}
                                disabled={isPending}
                              />
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
                              Mã hạng phòng{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <ScanBarcode className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  className="pl-9 font-mono uppercase"
                                  placeholder="VD: DLX-01"
                                  {...field}
                                  disabled={isPending}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxOccupancy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Users className="w-4 h-4" /> Sức chứa tối đa
                            </FormLabel>
                            <FormControl>
                              <Counter
                                minValue={1}
                                maxValue={20}
                                {...field}
                                isDisabled={isPending}
                                className="h-12 w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Price & Capacity */}
                      <FormField
                        control={form.control}
                        name="baseRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Giá cơ bản / đêm{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                startAddon={
                                  <DollarSign className=" h-5 w-5 text-muted-foreground" />
                                }
                                type="number"
                                className="text-lg font-bold text-right "
                                placeholder="0"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  field.onChange(
                                    val === "" ? undefined : parseFloat(val)
                                  );
                                }}
                                disabled={isPending}
                                endAddon={
                                  <span className="text-xs font-bold text-muted-foreground">
                                    VND
                                  </span>
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Active Toggle */}
                    </div>{" "}
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
                                id="menu-item-active-switch"
                              />
                              <div className="grid grow gap-2">
                                <FormLabel
                                  className="text-xs font-medium cursor-pointer flex-col items-start mb-0 pb-0"
                                  htmlFor="menu-item-active-switch"
                                >
                                  <p>
                                    {field.value ? "Hoạt động" : "Tạm ngưng"}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {field.value
                                      ? "Hạng phòng sẽ hiển thị trên trang đặt phòng."
                                      : "Hạng phòng sẽ không hiển thị trên trang đặt phòng."}
                                  </p>
                                </FormLabel>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* --- TAB 2: DESCRIPTION --- */}
                  <TabsContent
                    value="description"
                    className="mt-0 h-full outline-none"
                  >
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormControl>
                            <div className="border rounded-md overflow-hidden min-h-[300px] bg-background">
                              <MinimalTiptap
                                content={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Mô tả chi tiết..."
                                className="min-h-[300px] border-none shadow-none"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* --- TAB 3: MEDIA --- */}
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
                      {/* Upload Button */}
                      <Dropzone
                        accept={{ "image/*": [] }}
                        maxFiles={8}
                        onDrop={onDropNewFiles}
                        className="group aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5"
                      >
                        <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                          <div className="p-3 rounded-full bg-background shadow-sm border group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-medium">Thêm ảnh</span>
                        </div>
                      </Dropzone>

                      {/* Previews */}
                      {previews.map((url, index) => (
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
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>

            {/* === FOOTER === */}
            <DialogFooter className="p-6 pt-4 border-t shrink-0 ">
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
                    Đang lưu...
                  </>
                ) : (
                  <>Tạo hạng phòng</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
