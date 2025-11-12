import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";

import {
  useRoomTypeFormDialogs,
  useRoomTypeImageHandlers,
  useRoomTypeDescriptionHandler,
  useRoomTypeCloseHandler,
} from "./form.hooks";
import { useRoomTypeDetail } from "./query.hooks";
import { useUpdateRoomType, useDeleteRoomType } from "./mutation.hooks";
import { RoomTypesSchema } from "~/services/api/room-types/room-types.schema";

const { UpdateRoomTypesDetailRequestSchema } = RoomTypesSchema;

type EditRoomTypeFormData = z.infer<typeof UpdateRoomTypesDetailRequestSchema>;

interface UseUpdateRoomTypeSheetProps {
  open: boolean;
  onClose: (open: boolean) => void;
  roomType: RoomTypesListItemDto | null;
}

export function useUpdateRoomTypeSheet({
  open,
  onClose,
  roomType,
}: UseUpdateRoomTypeSheetProps) {
  const { mutate: updateRoomType, isPending } = useUpdateRoomType(
    roomType?.id || ""
  );
  const { mutate: deleteRoomType } = useDeleteRoomType(roomType?.id || "");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: roomTypeDetail } = useRoomTypeDetail({
    id: roomType?.id || "",
    open: open && !!roomType,
  });
  const form = useForm<EditRoomTypeFormData>({
    resolver: zodResolver(UpdateRoomTypesDetailRequestSchema),
    defaultValues: {
      code: roomType?.code,
      name: roomType?.name,
      description: roomTypeDetail?.description ?? "",
      baseRate: roomTypeDetail?.baseRate,
      maxOccupancy: roomTypeDetail?.maxOccupancy,
      active: roomTypeDetail?.active,
      images: [], //! should use roomtypetDetail?.images here
      removeMediaIds: [],
    },
  });

  useEffect(() => {
    if (!roomType || !roomTypeDetail) return;
    form.reset({
      code: roomType.code,
      name: roomType.name,
      description: roomTypeDetail.description ?? "",
      baseRate: roomTypeDetail.baseRate,
      maxOccupancy: roomTypeDetail.maxOccupancy,
      active: roomTypeDetail.active,
      images: [],
      removeMediaIds: [],
    });
  }, [roomType, roomTypeDetail, form]);

  const {
    showDescriptionDialog,
    setShowDescriptionDialog,
    showImagePreviewDialog,
    setShowImagePreviewDialog,
    dialogMode,
    handleOpenDescription,
    handleOpenImagePreview,
  } = useRoomTypeFormDialogs();

  const { handleAddImages, handleRemoveNewFile } =
    useRoomTypeImageHandlers(form);

  const { handleDescriptionSave } = useRoomTypeDescriptionHandler(form);

  const { handleClose, handleConfirmClose } = useRoomTypeCloseHandler(
    form,
    () => onClose(false),
    {
      useAlertDialog: true,
      setShowCancelDialog,
      additionalDirtyCheck: () => {
        const removeIds = form.watch("removeMediaIds") || [];
        return removeIds.length > 0;
      },
    }
  );

  const removeMediaIds = form.watch("removeMediaIds") || [];
  const newImageFiles = form.watch("images") || [];
  const existingImages = roomTypeDetail?.images || [];
  const remainingImages = existingImages.filter(
    (img) => !removeMediaIds.includes(img.mediaId)
  );
  const totalImagesAfterSubmit = remainingImages.length + newImageFiles.length;

  const handleMarkForDeletion = (mediaId: string) => {
    const currentRemoveIds = form.getValues("removeMediaIds") || [];
    console.log(currentRemoveIds);
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
      console.log(form.getValues("removeMediaIds"));
    }
  };

  const handleSubmit = (data: EditRoomTypeFormData) => {
    submitForm(data);
  };

  const submitForm = (data: EditRoomTypeFormData) => {
    if (!roomType) return;

    updateRoomType(
      {
        data: {
          ...data,
          images: data.images || [],
          removeMediaIds: data.removeMediaIds || [],
        },
      },
      {
        onSuccess: () => {
          onClose(true);
          form.reset();
        },
      }
    );
  };

  return {
    // Form
    form,
    isPending,

    // State
    showCancelDialog,
    setShowCancelDialog,
    showDescriptionDialog,
    setShowDescriptionDialog,
    showImagePreviewDialog,
    setShowImagePreviewDialog,
    dialogMode,
    handleOpenDescription,
    handleOpenImagePreview,

    // Computed values
    removeMediaIds,
    newImageFiles,
    existingImages,
    remainingImages,
    totalImagesAfterSubmit,

    // Handlers
    handleDeleteRoomType: deleteRoomType,
    handleClose,
    handleConfirmClose,
    handleRemoveNewFile,
    handleMarkForDeletion,
    handleAddImages,
    handleSubmit,
    handleDescriptionSave,
  };
}
