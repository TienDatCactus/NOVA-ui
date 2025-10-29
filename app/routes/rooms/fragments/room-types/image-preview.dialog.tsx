import {
  FileImage,
  ImageIcon,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Image from "~/components/ui/image";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import {
  Dropzone,
  DropzoneEmptyState,
} from "~/components/ui/shadcn-io/dropzone";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { Spinner } from "~/components/ui/shadcn-io/spinner";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn, formatFileSize } from "~/lib/utils";
import type { UpdateRoomTypesDetailResponseDto } from "~/services/api/room-types/dto";

interface ImagePreviewDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  existingImages: UpdateRoomTypesDetailResponseDto["images"];
  newImages: (File | undefined)[];
  removeMediaIds: string[];
  initialTab?: "existing" | "new";
  roomTypeCode?: string;
  onAddImages?: (files: File[]) => void;
  onRemoveNewImage?: (index: number) => void;
  onMarkForDeletion?: (mediaId: string) => void;
}

export function ImagePreviewDialog({
  open,
  onClose,
  existingImages,
  newImages,
  removeMediaIds,
  initialTab = "existing",
  roomTypeCode = "",
  onAddImages,
  onRemoveNewImage,
  onMarkForDeletion,
}: ImagePreviewDialogProps) {
  const [activeTab, setActiveTab] = useState<"existing" | "new">(initialTab);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const activeExistingImages = useMemo(
    () => existingImages.filter((img) => !removeMediaIds.includes(img.mediaId)),
    [existingImages, removeMediaIds]
  );

  const markedForDeletionImages = useMemo(
    () => existingImages.filter((img) => removeMediaIds.includes(img.mediaId)),
    [existingImages, removeMediaIds]
  );

  const newImagePreviews = useMemo(() => {
    return newImages
      .filter((file): file is File => file !== undefined)
      .map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));
  }, [newImages]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [newImagePreviews]);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setIsSelectionMode(false);
      setSelectedImages(new Set());
    }
  }, [open, initialTab]);

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedImages(new Set());
  };

  const handleToggleImageSelection = (mediaId: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(mediaId)) {
        next.delete(mediaId);
      } else {
        next.add(mediaId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allActiveIds = new Set(
      activeExistingImages.map((img) => img.mediaId)
    );
    setSelectedImages(allActiveIds);
  };

  const handleDeselectAll = () => {
    setSelectedImages(new Set());
  };

  const handleConfirmMarkForDeletion = () => {
    selectedImages.forEach((mediaId) => {
      onMarkForDeletion?.(mediaId);
    });
    setSelectedImages(new Set());
    setIsSelectionMode(false);
    setShowDeleteConfirm(false);
    toast.success(`Đã đánh dấu ${selectedImages.size} ảnh để xóa`);
  };

  const handleRestoreImage = (mediaId: string) => {
    onMarkForDeletion?.(mediaId);
    toast.success("Đã khôi phục ảnh");
  };

  const handleDropzoneUpload = (files: File[]) => {
    try {
      setLoading(true);
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          errors.push(`${file.name}: Chỉ chấp nhận file ảnh`);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`${file.name}: Kích thước phải < 5MB`);
          return;
        }
        validFiles.push(file);
      });

      if (errors.length > 0) {
        toast.error(errors.join("\n"));
      }

      if (validFiles.length > 0) {
        onAddImages?.(validFiles);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[900px] max-h-[90vh] flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Hình ảnh hạng phòng {roomTypeCode}</DialogTitle>
          <DialogDescription>
            Xem trước hình ảnh hiện tại và hình ảnh mới
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "existing" | "new")}
          className="flex flex-col "
        >
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="existing" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Ảnh hiện tại
              <Badge variant="outline" className="text-xs">
                {activeExistingImages.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-2">
              <FileImage className="h-4 w-4" />
              Ảnh mới
              <Badge variant="outline" className="text-xs">
                {newImages.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="existing" className="flex flex-col">
            {existingImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Không có ảnh hiện tại</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-md flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {activeExistingImages.length} ảnh
                    </Badge>
                    {markedForDeletionImages.length > 0 && (
                      <Badge variant="destructive" className="gap-1">
                        <Trash2 className="h-3 w-3" />
                        {markedForDeletionImages.length} sẽ xóa
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Chế độ chọn
                    </span>
                    <Switch
                      checked={isSelectionMode}
                      onCheckedChange={handleToggleSelectionMode}
                    />
                  </div>
                </div>

                <ScrollArea className="h-[300px]">
                  <div className="grid md:grid-cols-4 grid-cols-3  gap-4 p-4 ">
                    {activeExistingImages.map((img, index) => {
                      const isSelected = selectedImages.has(img.mediaId);
                      return (
                        <div
                          key={img.mediaId}
                          className={cn(
                            "relative bg-muted rounded-lg group cursor-pointer transition-all border-2 ",
                            isSelectionMode &&
                              "hover:ring-2 hover:ring-primary",
                            isSelected && "ring-2 ring-primary scale-[0.98]"
                          )}
                          onClick={() =>
                            isSelectionMode &&
                            handleToggleImageSelection(img.mediaId)
                          }
                        >
                          <ImageZoom isDisabled={isSelectionMode}>
                            <Image
                              src={img.url}
                              alt={img.caption || `Image ${index + 1}`}
                              height={120}
                              className="w-full object-contain aspect-square"
                            />
                          </ImageZoom>

                          {isSelectionMode && (
                            <div className="absolute top-2 left-2 z-10">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleToggleImageSelection(img.mediaId)
                                }
                                className="bg-white border-2 data-[state=checked]:bg-primary"
                              />
                            </div>
                          )}

                          <Badge
                            variant="secondary"
                            className="absolute bottom-2 left-2 text-xs"
                          >
                            #{img.displayOrder}
                          </Badge>

                          {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-xs text-white truncate">
                                {img.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {markedForDeletionImages.map((img, index) => (
                      <div
                        key={img.mediaId}
                        className="relative bg-muted rounded-lg overflow-hidden group opacity-40 border-2 border-destructive"
                      >
                        <Image
                          src={img.url}
                          alt={img.caption || `Image ${index + 1}`}
                          className="w-full h-full object-cover aspect-square grayscale"
                        />

                        {/* Restore Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                          onClick={() => handleRestoreImage(img.mediaId)}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Khôi phục
                        </Button>

                        <Badge
                          variant="destructive"
                          className="absolute top-2 right-2 text-xs gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Sẽ xóa
                        </Badge>

                        <Badge
                          variant="secondary"
                          className="absolute bottom-2 left-2 text-xs"
                        >
                          #{img.displayOrder}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {isSelectionMode && selectedImages.size > 0 && (
                  <div className="flex w-full items-center justify-between px-4 py-3 bg-primary/10 border-2 border-primary rounded-md flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={true}
                        className="pointer-events-none"
                      />
                      <span className="text-sm font-medium">
                        Đã chọn {selectedImages.size}/
                        {activeExistingImages.length} ảnh
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {selectedImages.size < activeExistingImages.length && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          Chọn tất cả
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeselectAll}
                      >
                        Bỏ chọn
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa đã chọn
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="new"
            className="h-[400px] flex flex-col justify-between"
          >
            <Dropzone
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
              maxFiles={10}
              maxSize={5 * 1024 * 1024}
              onDrop={(acceptedFiles) => handleDropzoneUpload(acceptedFiles)}
              className="min-h-[120px] "
            >
              <DropzoneEmptyState>
                <div className="flex flex-1 flex-col items-center justify-center">
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {loading ? (
                      <>
                        <Spinner size={20} />
                      </>
                    ) : (
                      <Upload size={20} />
                    )}
                  </div>
                  <p className="my-2 font-medium text-sm">
                    Tải lên hình ảnh mới
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Kéo thả hoặc click để chọn ảnh
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Chấp nhận: JPG, PNG, WebP. Tối đa 5MB/ảnh
                  </p>
                </div>
              </DropzoneEmptyState>
            </Dropzone>

            {newImages.length !== 0 && (
              <>
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                  <ul className="flex flex-row space-x-4 p-4">
                    {newImagePreviews.map((preview, index) => (
                      <li
                        key={index}
                        className="relative h-fit bg-muted rounded-lg border-2 border-primary/20 group"
                      >
                        <Image
                          src={preview.url}
                          alt={preview.name}
                          width={100}
                          height={100}
                          className="object-contain"
                        />
                        <Badge
                          variant="default"
                          className="absolute top-2 left-2"
                        >
                          Mới
                        </Badge>
                        {onRemoveNewImage && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onRemoveNewImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Badge variant="info">{newImages.length}</Badge>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {newImagePreviews[0]?.name}
                    </p>
                  </div>
                  <Badge variant="success" className="text-xs">
                    Tổng:{" "}
                    {formatFileSize(
                      newImagePreviews.reduce(
                        (total, cur) => total + cur.size,
                        0
                      )
                    )}
                  </Badge>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        {/* Confirmation Dialog */}
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận đánh dấu xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn muốn đánh dấu {selectedImages.size} ảnh để xóa?
                <br />
                <span className="text-destructive font-medium">
                  Ảnh sẽ bị xóa vĩnh viễn khi bạn lưu thay đổi.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmMarkForDeletion}
                className="bg-destructive hover:bg-destructive/90"
              >
                Đánh dấu xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DialogFooter>
          <Button onClick={() => onClose(false)}>Hoàn tất</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
