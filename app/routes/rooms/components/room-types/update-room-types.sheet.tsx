import { zodResolver } from "@hookform/resolvers/zod";
import {
  BedDouble,
  DollarSign,
  FileText,
  Hash,
  ImageIcon,
  Info,
  Layers,
  Package,
  RotateCcw,
  Save,
  ScanBarcode,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
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
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "~/components/ui/shadcn-io/dropzone";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
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
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { cn, onError } from "~/lib/utils";
import { RoomTypesSchema } from "~/services/api/room-types/room-types.schema";
import { useRoomTypeDetail } from "../../container/room-types/query.hooks";
import {
  useUpdateRoomType,
  useDeleteRoomType,
} from "../../container/room-types/mutation.hooks";
import { toast } from "sonner";

import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";

const { UpdateRoomTypesDetailRequestSchema } = RoomTypesSchema;
type UpdateRoomTypeFormData = z.infer<
  typeof UpdateRoomTypesDetailRequestSchema
>;

interface EditRoomTypeSheetProps {
  open: boolean;
  onClose: (open: boolean) => void;
  roomType: RoomTypesListItemDto | null;
}

export function UpdateRoomTypeSheet({
  open,
  onClose,
  roomType,
}: EditRoomTypeSheetProps) {
  // --- State ---
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("general");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: roomTypeDetail } = useRoomTypeDetail({
    id: roomType?.id || "",
    open,
  });
  const { mutate: updateRoomType, isPending: isUpdating } = useUpdateRoomType(
    roomType?.id || ""
  );
  const { mutate: deleteRoomType, isPending: isDeleting } = useDeleteRoomType(
    roomType?.id || ""
  );

  const isPending = isUpdating || isDeleting;
  const existingImages = roomTypeDetail?.images || [];

  const form = useForm<UpdateRoomTypeFormData>({
    resolver: zodResolver(UpdateRoomTypesDetailRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      baseRate: 0,
      maxOccupancy: 2,
      active: true,
      images: [],
      removeMediaIds: [],
    },
  });

  const handleSubmit = (data: UpdateRoomTypeFormData) => {
    updateRoomType(
      { data: { ...data, images: newFiles, removeMediaIds } },
      {
        onSuccess: () => {
          toast.success("Cập nhật hạng phòng thành công");
          onClose(false);
        },
        onError: () => {
          toast.error("Cập nhật hạng phòng thất bại");
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const isDirty =
        form.formState.isDirty ||
        newFiles.length > 0 ||
        removeMediaIds.length > 0;
      if (isDirty && !isPending) {
        setShowCancelDialog(true);
        return;
      }
      onClose(false);
    }
  };

  const handleConfirmClose = () => {
    setShowCancelDialog(false);
    form.reset();
    setNewFiles([]);
    setNewPreviews([]);
    setRemoveMediaIds([]);
    onClose(false);
  };

  const handleDeleteRoomType = () => {
    if (!roomType?.id) return;

    if (confirm("Bạn có chắc chắn muốn xóa hạng phòng này?")) {
      deleteRoomType(undefined, {
        onSuccess: () => {
          toast.success("Xóa hạng phòng thành công");
          onClose(false);
        },
        onError: () => {
          toast.error("Xóa hạng phòng thất bại");
        },
      });
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (roomTypeDetail && roomType) {
      form.reset({
        code: roomTypeDetail.code,
        name: roomTypeDetail.name,
        description: roomTypeDetail.description || "",
        baseRate: roomTypeDetail.baseRate,
        maxOccupancy: roomTypeDetail.maxOccupancy,
        active: roomTypeDetail.active,
        images: [],
        removeMediaIds: [],
      });
      setRemoveMediaIds([]);
      setNewFiles([]);
      setNewPreviews([]);
      setActiveTab("general");
    }
  }, [roomTypeDetail, roomType, form]);

  useEffect(() => {
    form.setValue("images", newFiles as any);
    form.setValue("removeMediaIds", removeMediaIds);
  }, [newFiles, removeMediaIds, form]);

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  // --- Handlers ---
  const onDropNewFiles = (accepted: File[]) => {
    setNewFiles((prev) => [...prev, ...accepted]);
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRemoveExisting = (id: string) => {
    setRemoveMediaIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  if (!roomType) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto w-full p-0 flex flex-col bg-background">
          <SheetHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <SheetTitle className="text-xl flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-primary" />
                Chỉnh sửa hạng phòng
              </SheetTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mã: {roomType.code}</span>
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] font-normal"
                >
                  {roomType.roomsCount} phòng
                </Badge>
              </div>
            </div>

            {/* Active Toggle */}
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, onError)}
              className="flex flex-col flex-1"
            >
              {/* === TABS & BODY === */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="border-b bg-muted/5 shrink-0">
                  <TabsList className=" p-0 h-12 gap-6 w-full justify-start">
                    <TabsTrigger value="general">
                      <Package className="w-4 h-4 mr-2" /> Thông tin chung
                    </TabsTrigger>
                    <TabsTrigger value="description">
                      <FileText className="w-4 h-4 mr-2" /> Mô tả
                    </TabsTrigger>
                    <TabsTrigger value="media">
                      <ImageIcon className="w-4 h-4 mr-2" /> Hình ảnh
                      {(newFiles.length > 0 ||
                        (existingImages?.length || 0) > 0) && (
                        <Badge
                          variant="secondary"
                          className="ml-2 px-1.5 py-0 h-5 text-[10px]"
                        >
                          {(existingImages?.length || 0) +
                            newFiles.length -
                            removeMediaIds.length}
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
                      <div className="space-y-6">
                        {/* Identity */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
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
                        </div>

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
                                  className="font-semibold text-right text-lg h-12"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  endAddon={
                                    <span className="text-sm font-bold text-muted-foreground">
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
                                        {field.value
                                          ? "Hoạt động"
                                          : "Tạm ngưng"}
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
                      </div>
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
                              <div className="border rounded-md overflow-hidden min-h-[300px]">
                                <MinimalTiptap
                                  content={field.value || ""}
                                  onChange={field.onChange}
                                  placeholder="Nhập mô tả chi tiết về tiện nghi, view, diện tích..."
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
                        <h4 className="text-sm font-medium">Thư viện ảnh</h4>
                        <span className="text-xs text-muted-foreground">
                          Tối đa 8 ảnh
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
                            <span className="text-xs font-medium">
                              Thêm ảnh
                            </span>
                          </div>
                        </Dropzone>

                        {/* New Previews */}
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

                        {/* Existing Images */}
                        {existingImages?.map((img) => {
                          const isRemoved = removeMediaIds.includes(
                            img.mediaId
                          );
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
              <SheetFooter className="p-6 pt-4 border-t shrink-0 ">
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isPending}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="button"
                    variant={"destructive"}
                    onClick={() => handleDeleteRoomType()}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa hạng phòng
                  </Button>
                  <Button
                    onClick={form.handleSubmit(handleSubmit, onError)}
                    disabled={isPending}
                    className="min-w-[140px]"
                  >
                    {isPending ? (
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
                </div>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Có thay đổi chưa được lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đóng? Tất cả thay đổi sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Đóng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
