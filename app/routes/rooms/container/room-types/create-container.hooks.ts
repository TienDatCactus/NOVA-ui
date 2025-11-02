import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import {
  useRoomTypeFormDialogs,
  useRoomTypeImageHandlers,
  useRoomTypeDescriptionHandler,
  useRoomTypeCloseHandler,
} from "./form.hooks";
import { useCreateRoomType } from "./mutation.hooks";
import { RoomTypesSchema } from "~/services/api/room-types/room-types.schema";

const { CreateRoomTypesRequestSchema } = RoomTypesSchema;

type CreateRoomTypeFormData = z.infer<typeof CreateRoomTypesRequestSchema>;

interface UseCreateRoomTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onShowCancelDialog: (show: boolean) => void;
}

export function useCreateRoomTypeDialog({
  open,
  onClose,
  onShowCancelDialog,
}: UseCreateRoomTypeDialogProps) {
  const { mutate, isPending } = useCreateRoomType();
  const form = useForm<CreateRoomTypeFormData>({
    resolver: zodResolver(CreateRoomTypesRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      baseRate: 0,
      maxOccupancy: 2,
      active: true,
      images: [],
    },
  });

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
    onClose,
    {
      useAlertDialog: true,
      setShowCancelDialog: (show) => onShowCancelDialog(show),
    }
  );
  const newImageFiles = form.watch("images") || [];

  const handleSubmit = (data: CreateRoomTypeFormData) => {
    mutate(
      {
        ...data,
        images: data.images || [],
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  return {
    // Form
    form,
    isPending,

    // State
    showDescriptionDialog,
    setShowDescriptionDialog,
    showImagePreviewDialog,
    setShowImagePreviewDialog,
    dialogMode,

    // Computed values
    newImageFiles,

    // Handlers
    handleClose,
    handleSubmit,
    handleDescriptionSave,
    handleOpenDescription,
    handleOpenImagePreview,
    handleAddImages,
    handleRemoveNewFile,
    handleConfirmClose,
  };
}
