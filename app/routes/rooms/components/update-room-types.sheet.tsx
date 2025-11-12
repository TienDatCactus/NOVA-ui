import { X } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Separator } from "~/components/ui/separator";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
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
import { cn, onError } from "~/lib/utils";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";

import { useUpdateRoomTypeSheet } from "../container/room-types/update-container.hooks";

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
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<string[]>([]);

  const {
    form,
    isPending,
    showCancelDialog,
    setShowCancelDialog,
    existingImages,

    // Handlers
    handleClose,
    handleConfirmClose,
    handleSubmit,
    handleDeleteRoomType,
  } = useUpdateRoomTypeSheet({ open, onClose, roomType });

  useEffect(() => {
    if (roomType) {
      setRemoveMediaIds([]);
      setNewFiles([]);
      setNewPreviews([]);
    }
  }, [roomType]);

  useEffect(() => {
    form.setValue("images", newFiles as any);
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
      prev.includes(id)
        ? prev.filter((mediaId) => mediaId !== id)
        : [...prev, id]
    );
  };

  if (!roomType) return null;
  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[800px] h-screen overflow-y-auto">
          <SheetHeader>
            <div className="flex justify-between items-center">
              <div>
                <SheetTitle>Chỉnh sửa hạng phòng</SheetTitle>
                <SheetDescription>
                  Cập nhật thông tin hạng phòng {roomType.code}
                </SheetDescription>
              </div>
              <div>
                {roomType && (
                  <Badge variant="info">Có {roomType.roomsCount} phòng</Badge>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4 px-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, onError)}
                className="space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>Mã hạng phòng *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: DELUXE"
                            {...field}
                            disabled={isPending}
                          />
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
                      <FormItem className="col-span-2">
                        <FormLabel>Tên hạng phòng *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Phòng Deluxe"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="baseRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá cơ bản (VNĐ) *</FormLabel>
                        <FormControl>
                          <Counter
                            minValue={0}
                            {...field}
                            isDisabled={form.formState.isSubmitting}
                          />
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
                        <FormLabel>Sức chứa tối đa</FormLabel>
                        <FormControl>
                          <Counter
                            minValue={0}
                            maxValue={10}
                            {...field}
                            isDisabled={form.formState.isSubmitting}
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
                        <MinimalTiptap
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Nhập mô tả hạng phòng..."
                          className="min-h-[200px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Hình ảnh
                  </h3>

                  {/* Existing Images */}
                  <div className="space-y-2">
                    <FormLabel>Hình ảnh hiện có</FormLabel>
                    {!existingImages || existingImages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Không có hình ảnh
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((img) => {
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
                                  className="data-[state=checked]:bg-destructive border-destructive data-[state=checked]:border-destructive"
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

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border-dashed border-primary border-2 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Trạng thái</FormLabel>
                        <FormDescription className="text-sm">
                          Kích hoạt hạng phòng này
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
          <SheetFooter className="">
            <div className="flex justify-between items-center">
              <Button
                variant={"destructive"}
                onClick={() => handleDeleteRoomType()}
              >
                Xóa hạng phòng
              </Button>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Hủy
                </Button>
                <Button
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isPending}
                >
                  {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* cancel dialog for dirty form */}
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
