import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

/**
 * Shared logic for room type forms (Create & Update)
 * Manages dialog states, description/image handlers
 */
export function useRoomTypeFormDialogs() {
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [showImagePreviewDialog, setShowImagePreviewDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"preview" | "edit">("edit");

  const handleOpenDescription = (type: "preview" | "edit") => {
    setDialogMode(type);
    setShowDescriptionDialog(true);
  };
  const handleOpenImagePreview = (type: "preview" | "edit") => {
    setDialogMode(type);
    setShowImagePreviewDialog(true);
  };
  return {
    dialogMode,
    handleOpenImagePreview,
    handleOpenDescription,
    // State
    showDescriptionDialog,
    setShowDescriptionDialog,
    showImagePreviewDialog,
    setShowImagePreviewDialog,
  };
}

/**
 * Shared image handlers for room type forms
 */
export function useRoomTypeImageHandlers<
  // biome-ignore lint/suspicious/noExplicitAny: Generic form type
  T extends Record<string, any>,
>(form: UseFormReturn<T>) {
  const handleAddImages = (files: File[]) => {
    const currentFiles =
      (form.getValues("images" as never) as unknown as File[]) || [];
    form.setValue("images" as never, [...currentFiles, ...files] as never, {
      shouldDirty: true,
    });
  };

  const handleRemoveNewFile = (index: number) => {
    const currentFiles =
      (form.getValues("images" as never) as unknown as File[]) || [];
    form.setValue(
      "images" as never,
      currentFiles.filter((_, i) => i !== index) as never,
      { shouldDirty: true }
    );
  };

  return {
    handleAddImages,
    handleRemoveNewFile,
  };
}

/**
 * Shared description handler for room type forms
 */
export function useRoomTypeDescriptionHandler<
  // biome-ignore lint/suspicious/noExplicitAny: Generic form type
  T extends Record<string, any>,
>(form: UseFormReturn<T>) {
  const handleDescriptionSave = (content: string) => {
    form.setValue("description" as never, content as never, {
      shouldDirty: true,
    });
  };

  return { handleDescriptionSave };
}

/**
 * Shared close handler with dirty check
 */
export function useRoomTypeCloseHandler<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  onClose: () => void,
  options?: {
    useAlertDialog?: boolean;
    setShowCancelDialog?: (show: boolean) => void;
    additionalDirtyCheck?: () => boolean;
  }
) {
  const handleClose = () => {
    const newImageFiles =
      (form.watch("images" as never) as unknown as File[]) || [];
    const additionalDirty = options?.additionalDirtyCheck?.() || false;

    if (form.formState.isDirty || newImageFiles.length > 0 || additionalDirty) {
      if (options?.useAlertDialog && options?.setShowCancelDialog) {
        options.setShowCancelDialog(true);
      }
    } else {
      form.reset();
      onClose();
    }
  };

  const handleConfirmClose = () => {
    if (options?.setShowCancelDialog) {
      options.setShowCancelDialog(false);
    }
    form.reset();
    onClose();
  };

  return {
    handleClose,
    handleConfirmClose,
  };
}
