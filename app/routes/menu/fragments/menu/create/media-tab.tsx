import { ImagePlus, X } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import Image from "~/components/ui/image";
import { Dropzone } from "~/components/ui/shadcn-io/dropzone";
import { TabsContent } from "~/components/ui/tabs";

interface MediaTabProps {
  imagePreview: string[];
  handleRemoveImage: (index: number) => void;
  formErrors?: { message?: string; type?: string };
  onDrop: (acceptedFiles: File[]) => void;
}

const MediaTab: React.FC<MediaTabProps> = ({
  imagePreview,
  handleRemoveImage,
  formErrors,
  onDrop,
}) => {
  return (
    <TabsContent
      value="media"
      className="mt-0 h-full flex flex-col outline-none"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Thư viện ảnh</h4>
            {formErrors && formErrors.message && (
              <p className="text-xs text-destructive font-medium">
                {formErrors.message}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {imagePreview.length} / 8 ảnh
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {/* 1. Upload Button (Always First) */}
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

          {/* 2. Previews */}
          {imagePreview.map((url, index) => (
            <div
              key={`new-${index}`}
              className="group relative aspect-square rounded-xl overflow-hidden border bg-background shadow-sm animate-in fade-in zoom-in duration-300"
            >
              <Image
                src={url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <Badge className="absolute bottom-1.5 left-1.5 h-5 px-1.5 text-[10px] bg-blue-600 text-white hover:bg-blue-700 border-none">
                Mới
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </TabsContent>
  );
};

export default MediaTab;
