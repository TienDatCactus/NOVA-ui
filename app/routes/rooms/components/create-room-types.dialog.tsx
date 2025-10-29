import { FileText, ImageIcon, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { stripHtml } from "~/lib/utils";
import { useCreateRoomTypeDialog } from "../container/create-room-type.hooks";
import { DescriptionDialog } from "../fragments/room-types/description.dialog";
import { ImagePreviewDialog } from "../fragments/room-types/image-preview.dialog";
import { Card, CardContent } from "~/components/ui/card";
import { useState } from "react";
import AlertChanges from "~/components/ui/alert-changes";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";

interface CreateRoomTypeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateRoomTypeDialog({
  open,
  onClose,
}: CreateRoomTypeDialogProps) {
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const {
    // Form
    form,
    isPending,

    // State
    showDescriptionDialog,
    setShowDescriptionDialog,
    showImagePreviewDialog,
    setShowImagePreviewDialog,
    descriptionDialogMode,

    // Computed values
    newImageFiles,

    // Handlers
    handleClose,
    handleSubmit,
    handleDescriptionSave,
    handleOpenDescriptionEdit,
    handleOpenImageEdit,
    handleAddImages,
    handleRemoveNewFile,
    handleConfirmClose,
  } = useCreateRoomTypeDialog({
    open,
    onClose,
    onShowCancelDialog: setOpenCancelDialog,
  });

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Thêm hạng phòng mới</DialogTitle>
            <DialogDescription>
              Điền thông tin cơ bản để tạo hạng phòng
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="flex-1 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                            className="uppercase"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="baseRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá cơ bản *</FormLabel>
                        <FormControl>
                          <Counter
                            minValue={0}
                            value={field.value}
                            onChange={field.onChange}
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
                        <FormLabel>Sức chứa</FormLabel>
                        <FormControl>
                          <Counter
                            minValue={0}
                            maxValue={10}
                            value={field.value}
                            onChange={field.onChange}
                            isDisabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border-2 p-3 bg-muted/30 border-primary border-dashed ">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Kích hoạt ngay
                        </FormLabel>
                        <FormDescription className="text-xs text-muted-foreground">
                          Hạng phòng này có thể sử dụng ngay
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
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Thông tin bổ sung
                </h3>

                <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 shadow-s h-18 rounded-lg border ">
                    <CardContent className="p-0 flex items-center justify-between ">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Mô tả</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {form.watch("description")
                              ? stripHtml(form.watch("description") || "")
                              : "Thêm mô tả chi tiết..."}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenDescriptionEdit}
                        className="flex-shrink-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="p-4 shadow-s h-18 rounded-lg border">
                    <CardContent className="p-0 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Hình ảnh</p>
                          <p className="text-xs text-muted-foreground">
                            {newImageFiles.length > 0 ? (
                              <>
                                <span className="font-medium text-foreground">
                                  {newImageFiles.length}
                                </span>{" "}
                                ảnh đã chọn
                              </>
                            ) : (
                              "Thêm hình ảnh..."
                            )}
                          </p>
                        </div>
                        {newImageFiles.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {newImageFiles.length}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenImageEdit}
                        className="flex-shrink-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />
            </form>
          </Form>
          <DialogFooter>
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
              {isPending ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Description Dialog */}
      <DescriptionDialog
        open={showDescriptionDialog}
        onClose={setShowDescriptionDialog}
        initialContent={form.watch("description") || ""}
        roomTypeCode={form.watch("code") || "MỚI"}
        mode={descriptionDialogMode}
        onSave={handleDescriptionSave}
      />

      <ImagePreviewDialog
        open={showImagePreviewDialog}
        onClose={setShowImagePreviewDialog}
        existingImages={[]}
        newImages={newImageFiles}
        removeMediaIds={[]}
        initialTab="new"
        roomTypeCode={form.watch("code") || "MỚI"}
        onAddImages={handleAddImages}
        onRemoveNewImage={handleRemoveNewFile}
        operation="create"
      />

      <AlertChanges
        showCancelDialog={openCancelDialog}
        setShowCancelDialog={setOpenCancelDialog}
        handleConfirmClose={handleConfirmClose}
      />
    </>
  );
}
