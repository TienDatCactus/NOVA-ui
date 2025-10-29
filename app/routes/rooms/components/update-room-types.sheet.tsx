import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, FileText, ImageIcon, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import AlertChanges from "~/components/ui/alert-changes";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Switch } from "~/components/ui/switch";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import useRoomTypesSchema from "~/services/schema/room-types.schema";
import { useUpdateRoomType } from "../container/room-types-mutation.hooks";
import { useRoomTypeDetail } from "../container/room-types-query.hooks";
import { DescriptionDialog } from "../fragments/room-types/description.dialog";
import { ImagePreviewDialog } from "../fragments/room-types/image-preview.dialog";
import { stripHtml } from "~/lib/utils";

const { UpdateRoomTypesDetailRequestSchema } = useRoomTypesSchema();

type EditRoomTypeFormData = z.infer<typeof UpdateRoomTypesDetailRequestSchema>;

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
  const { mutate, isPending } = useUpdateRoomType();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [showImagePreviewDialog, setShowImagePreviewDialog] = useState(false);
  const [descriptionDialogMode, setDescriptionDialogMode] = useState<
    "preview" | "edit"
  >("preview");
  const [imagePreviewDialogMode, setImagePreviewDialogMode] = useState<
    "existing" | "new"
  >("existing");

  const { data: roomTypeDetail } = useRoomTypeDetail({
    id: roomType?.id || "",
    open: open && !!roomType,
  });

  const form = useForm<EditRoomTypeFormData>({
    resolver: zodResolver(UpdateRoomTypesDetailRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      baseRate: 0,
      maxOccupancy: 1,
      active: true,
      images: [],
      removeMediaIds: [],
    },
  });

  const removeMediaIds = form.watch("removeMediaIds") || [];
  const newImageFiles = form.watch("images") || [];

  useEffect(() => {
    if (roomTypeDetail) {
      form.reset({
        code: roomTypeDetail.code,
        name: roomTypeDetail.name,
        description: roomTypeDetail.description || "",
        baseRate: roomTypeDetail.baseRate,
        maxOccupancy: roomTypeDetail.maxOccupancy || 1,
        active: roomTypeDetail.active,
        images: [],
        removeMediaIds: [],
      });
    }
  }, [roomTypeDetail, form]);

  const handleClose = () => {
    if (
      form.formState.isDirty ||
      newImageFiles.length > 0 ||
      removeMediaIds.length > 0
    ) {
      setShowCancelDialog(true);
    } else {
      onClose(false);
      form.reset();
    }
  };

  const handleConfirmClose = () => {
    setShowCancelDialog(false);
    onClose(false);
    form.reset();
  };

  const handleRemoveNewFile = (index: number) => {
    const currentFiles = form.getValues("images") || [];
    form.setValue(
      "images",
      currentFiles.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleMarkForDeletion = (mediaId: string) => {
    const currentRemoveIds = form.getValues("removeMediaIds") || [];
    if (currentRemoveIds.includes(mediaId)) {
      form.setValue(
        "removeMediaIds",
        currentRemoveIds.filter((id) => id !== mediaId),
        { shouldDirty: true }
      );
    } else {
      form.setValue("removeMediaIds", [...currentRemoveIds, mediaId], {
        shouldDirty: true,
      });
    }
  };

  const existingImages = roomTypeDetail?.images || [];
  const remainingImages = existingImages.filter(
    (img) => !removeMediaIds.includes(img.mediaId)
  );
  const totalImagesAfterSubmit = remainingImages.length + newImageFiles.length;

  const handleSubmit = (data: EditRoomTypeFormData) => {
    if (totalImagesAfterSubmit === 0 && existingImages.length > 0) {
      setShowDeleteWarning(true);
      return;
    }

    submitForm(data);
  };

  const submitForm = (data: EditRoomTypeFormData) => {
    if (!roomType) return;

    mutate(
      {
        id: roomType.id,
        data: {
          ...data,
          images: data.images || [],
          removeMediaIds: data.removeMediaIds || [],
        },
      },
      {
        onSuccess: () => {
          onClose(false);
          form.reset();
        },
      }
    );
  };

  const handleDescriptionSave = (content: string) => {
    form.setValue("description", content, { shouldDirty: true });
  };

  const handleOpenDescriptionPreview = () => {
    setDescriptionDialogMode("preview");
    setShowDescriptionDialog(true);
  };

  const handleOpenDescriptionEdit = () => {
    setDescriptionDialogMode("edit");
    setShowDescriptionDialog(true);
  };

  const handleOpenImagePreview = () => {
    setImagePreviewDialogMode("existing");
    setShowImagePreviewDialog(true);
  };

  const handleOpenImageEdit = () => {
    setImagePreviewDialogMode("new");
    setShowImagePreviewDialog(true);
  };

  const handleAddImages = (files: File[]) => {
    const currentFiles = form.getValues("images") || [];
    form.setValue("images", [...currentFiles, ...files], {
      shouldDirty: true,
    });
  };

  if (!roomType) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[800px] overflow-y-auto">
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
                onSubmit={form.handleSubmit(handleSubmit)}
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
                          <Input
                            type="number"
                            placeholder="VD: 1000000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseFloat(e.target.value))
                            }
                            disabled={isPending}
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
                          <Input
                            type="number"
                            placeholder="VD: 4"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseInt(e.target.value))
                            }
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="shadow-s border  p-4">
                    <CardContent className="p-0 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">Mô tả</h3>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 ">
                          {form.watch("description")
                            ? stripHtml(form.watch("description") || "")
                            : "Chưa có mô tả"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleOpenDescriptionPreview}
                          className="flex-1"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Xem trước
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={handleOpenDescriptionEdit}
                          className="flex-1"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Chỉnh sửa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-s border p-4">
                    <CardContent className="p-0 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-semibold">Hình ảnh</h3>
                          <Badge variant="outline" className="text-xs">
                            {totalImagesAfterSubmit} ảnh
                          </Badge>
                          {removeMediaIds.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              -{removeMediaIds.length}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 mb-3 min-h-[40px]">
                        {existingImages.length === 0 &&
                        newImageFiles.length === 0 ? (
                          <div className="flex items-center justify-center w-full text-xs text-muted-foreground">
                            Chưa có hình ảnh
                          </div>
                        ) : (
                          <div className="text-center flex items-center justify-center flex-col text-sm text-muted-foreground w-full">
                            <p>
                              Sau khi lưu:{" "}
                              <span className="font-medium text-black">
                                {totalImagesAfterSubmit}
                              </span>{" "}
                              ảnh
                            </p>
                            {remainingImages.length > 0 && (
                              <p className="text-xs">
                                {remainingImages.length} cũ
                                {removeMediaIds.length > 0 && (
                                  <span className="text-destructive">
                                    {" "}
                                    (-{removeMediaIds.length})
                                  </span>
                                )}
                              </p>
                            )}
                            {newImageFiles.length > 0 && (
                              <p className="text-xs">
                                +{newImageFiles.length} mới
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleOpenImagePreview}
                          className="flex-1"
                          disabled={
                            existingImages.length === 0 &&
                            newImageFiles.length === 0
                          }
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Xem trước
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={handleOpenImageEdit}
                          className="flex-1"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Chỉnh sửa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                          disabled={isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Separator className="my-6" />

                <div className="flex justify-end gap-2 pt-4">
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
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      <AlertChanges
        showCancelDialog={showCancelDialog}
        setShowCancelDialog={setShowCancelDialog}
        handleConfirmClose={handleConfirmClose}
      />

      <AlertChanges
        showCancelDialog={showDeleteWarning}
        setShowCancelDialog={setShowDeleteWarning}
        handleConfirmClose={handleConfirmClose}
      />

      <DescriptionDialog
        open={showDescriptionDialog}
        onClose={setShowDescriptionDialog}
        initialContent={form.watch("description") || ""}
        roomTypeCode={roomType.code}
        mode={descriptionDialogMode}
        onSave={handleDescriptionSave}
      />

      <ImagePreviewDialog
        open={showImagePreviewDialog}
        onClose={setShowImagePreviewDialog}
        existingImages={existingImages}
        newImages={newImageFiles}
        removeMediaIds={removeMediaIds}
        initialTab={imagePreviewDialogMode}
        roomTypeCode={roomType.code}
        onAddImages={handleAddImages}
        onRemoveNewImage={handleRemoveNewFile}
        onMarkForDeletion={handleMarkForDeletion}
      />
    </>
  );
}
