import { ImagePlus, RotateCcw, Trash2, X } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";
import { Dropzone } from "~/components/ui/shadcn-io/dropzone";
import { TabsContent } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import type { MenuItemDetailDto } from "~/services/api/menu/dto";

interface MediaTabProps {
  menuItemDetail?: MenuItemDetailDto;
  newFiles: File[];
  newPreviews: string[];
  removeMediaIds: string[];
  toggleRemoveExisting: (id: string) => void;
  onDrop: (acceptedFiles: File[]) => void;
}

const MediaTab: React.FC<MediaTabProps> = ({
  menuItemDetail,
  newFiles,
  newPreviews,
  removeMediaIds,
  toggleRemoveExisting,
  onDrop,
}) => {
  return (
    <TabsContent
      value="media"
      className="mt-0 h-full flex flex-col outline-none"
    >
      <div className="space-y-4">
        {/* Header nhỏ để hướng dẫn */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Thư viện ảnh</h4>
            <p className="text-xs text-muted-foreground">
              Kéo thả hoặc nhấn vào ô dấu cộng để thêm ảnh. Tối đa 8 ảnh.
            </p>
          </div>
          {/* Hiển thị số lượng ảnh */}
          <Badge variant="outline" className="h-6">
            {(menuItemDetail?.images?.length || 0) +
              newFiles.length -
              removeMediaIds.length}{" "}
            / 8
          </Badge>
        </div>

        {/* THE GRID */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {/* 1. UPLOAD BUTTON (Ô đầu tiên) */}
          <Dropzone
            accept={{ "image/*": [] }}
            maxFiles={8}
            onDrop={onDrop}
            className="group aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <div className="p-3 rounded-full bg-background shadow-sm border group-hover:scale-110 transition-transform">
                <ImagePlus className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Thêm ảnh</span>
            </div>
          </Dropzone>

          {/* 2. NEW IMAGES PREVIEW */}
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

              <Badge className="absolute bottom-2 left-2  font-bold px-2 py-0.5 rounded-full shadow-sm">
                MỚI
              </Badge>

              <Button
                type="button"
                size="icon"
                variant="destructive-ghost"
                onClick={() => onDrop(newFiles.filter((_, i) => i !== index))}
                className="absolute w-6 h-6 top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}

          {/* 3. EXISTING IMAGES */}
          {menuItemDetail?.images?.map((img) => {
            const isRemoved = removeMediaIds.includes(img.mediaId);
            return (
              <div
                key={img.mediaId}
                className={cn(
                  "group relative aspect-square rounded-xl overflow-hidden border bg-background transition-all duration-200",
                  isRemoved
                    ? "border-destructive ring-2 ring-destructive/20 grayscale opacity-60" // Trạng thái chờ xóa
                    : "hover:shadow-md hover:border-primary/50" // Trạng thái bình thường
                )}
              >
                <Image
                  src={img.url}
                  alt="Existing"
                  className="w-full h-full object-cover"
                />

                {isRemoved ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-[1px]">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 rounded-full shadow-lg hover:scale-110 transition-transform"
                      onClick={() => toggleRemoveExisting(img.mediaId)}
                      title="Phục hồi ảnh"
                    >
                      <RotateCcw className="w-4 h-4 text-foreground" />
                    </Button>
                    <span className="mt-2 text-[10px] font-bold text-destructive bg-white/80 px-2 py-0.5 rounded-full">
                      Sẽ xóa
                    </span>
                  </div>
                ) : (
                  // Giao diện bình thường -> Hiện nút Xóa khi hover
                  <Button
                    type="button"
                    onClick={() => toggleRemoveExisting(img.mediaId)}
                    className=" w-6 h-6 absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Xóa ảnh này"
                    size="icon"
                    variant="destructive-ghost"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TabsContent>
  );
};

export default MediaTab;
