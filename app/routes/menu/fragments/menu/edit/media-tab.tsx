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
  handleRemoveNew: (index: number) => void;
  formErrors?: { message?: string; type?: string };
}

const MediaTab: React.FC<MediaTabProps> = ({
  menuItemDetail,
  newFiles,
  newPreviews,
  removeMediaIds,
  toggleRemoveExisting,
  onDrop,
  handleRemoveNew,
  formErrors,
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
            {formErrors && formErrors.message && (
              <p className="text-xs text-destructive font-medium">
                {formErrors.message}
              </p>
            )}
            {!formErrors?.message && (
              <p className="text-xs text-muted-foreground">
                Kéo thả hoặc nhấn vào ô dấu cộng để thêm ảnh. Tối đa 10 ảnh.
              </p>
            )}
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
        <div className="grid grid-cols-3 sm:grid-cols-4  gap-4">
          <Dropzone
            accept={{ "image/*": [] }}
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
                onClick={() => handleRemoveNew(index)}
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

                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant={isRemoved ? "secondary" : "destructive"}
                    size="sm"
                    className="h-8 px-3 rounded-full shadow-lg"
                    onClick={() => toggleRemoveExisting(img.mediaId)}
                  >
                    {isRemoved ? (
                      <>
                        <RotateCcw className="w-3 h-3 mr-1.5" /> Phục hồi
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3 mr-1.5" /> Xóa ảnh
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
      </div>
    </TabsContent>
  );
};

export default MediaTab;
