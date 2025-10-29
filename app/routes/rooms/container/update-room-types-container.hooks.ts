import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import useRoomTypesSchema from "~/services/schema/room-types.schema";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { useUpdateRoomType } from "./room-types-mutation.hooks";
import { useRoomTypeDetail } from "./room-types-query.hooks";
import {
  useRoomTypeFormDialogs,
  useRoomTypeImageHandlers,
  useRoomTypeDescriptionHandler,
  useRoomTypeCloseHandler,
} from "./room-type-form.hooks";

const { UpdateRoomTypesDetailRequestSchema } = useRoomTypesSchema();

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
  const { mutate, isPending } = useUpdateRoomType();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [imagePreviewDialogMode, setImagePreviewDialogMode] = useState<
    "existing" | "new"
  >("existing");

  const { data: roomTypeDetail } = useRoomTypeDetail({
    id: roomType?.id || "",
    open: open && !!roomType,
  });

  // Form setup
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

  const {
    showDescriptionDialog,
    setShowDescriptionDialog,
    showImagePreviewDialog,
    setShowImagePreviewDialog,
    descriptionDialogMode,
    handleOpenDescriptionPreview,
    handleOpenDescriptionEdit,
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

  // Computed values
  const removeMediaIds = form.watch("removeMediaIds") || [];
  const newImageFiles = form.watch("images") || [];
  const existingImages = roomTypeDetail?.images || [];
  const remainingImages = existingImages.filter(
    (img) => !removeMediaIds.includes(img.mediaId)
  );
  const totalImagesAfterSubmit = remainingImages.length + newImageFiles.length;

  // Reset form when room type detail changes
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

  const handleOpenImagePreview = () => {
    setImagePreviewDialogMode("existing");
    setShowImagePreviewDialog(true);
  };

  const handleOpenImageEdit = () => {
    setImagePreviewDialogMode("new");
    setShowImagePreviewDialog(true);
  };

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

  // Helper to strip HTML tags for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return {
    // Form
    form,
    isPending,

    // State
    showCancelDialog,
    setShowCancelDialog,
    showDeleteWarning,
    setShowDeleteWarning,
    showDescriptionDialog,
    setShowDescriptionDialog,
    showImagePreviewDialog,
    setShowImagePreviewDialog,
    descriptionDialogMode,
    imagePreviewDialogMode,

    // Computed values
    removeMediaIds,
    newImageFiles,
    existingImages,
    remainingImages,
    totalImagesAfterSubmit,

    // Handlers
    handleClose,
    handleConfirmClose,
    handleRemoveNewFile,
    handleMarkForDeletion,
    handleAddImages,
    handleSubmit,
    handleDescriptionSave,
    handleOpenDescriptionPreview,
    handleOpenDescriptionEdit,
    handleOpenImagePreview,
    handleOpenImageEdit,
  };
}
