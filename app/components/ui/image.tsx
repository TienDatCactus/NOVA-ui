import React, { useEffect, useState, type ComponentProps } from "react";
import { cn } from "~/lib/utils";
import { Skeleton } from "./skeleton";
import { ImageOff } from "lucide-react";
interface ImageProps {
  width?: number;
  height?: number;
  src: string;
  alt?: string;
  addBaseUrl?: boolean;
  undefined?: boolean;
}
const Image: React.FC<ComponentProps<"img"> & ImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  style,
  undefined,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(src);

  useEffect(() => {
    if (src) {
      setLoading(true);
      setError(false);
      setImageSrc(src);
    }
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
  };
  const handleError = () => {
    setLoading(false);
    setError(true);
  };
  if (undefined || error) {
    return (
      <Skeleton
        style={{ width, height }}
        className="rounded-lg animate-none  flex flex-col items-center justify-center gap-2"
      >
        <ImageOff />
        <p>Không có hình ảnh</p>
      </Skeleton>
    );
  }
  return (
    <div
      style={{ width, height }}
      className={`relative flex items-center justify-center`}
    >
      {loading && !error && (
        <Skeleton className="h-full w-full rounded-lg absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base text-muted-foreground">Đang tải...</span>
        </Skeleton>
      )}
      <img
        src={imageSrc}
        alt={alt || "image"}
        onLoad={handleLoad}
        width={width}
        height={height}
        onError={handleError}
        className={cn(
          `w-full h-full object-cover rounded-lg transition-opacity duration-300`,
          {
            "opacity-0": loading,
            "opacity-100": !loading,
            className,
          }
        )}
        {...props}
      />
    </div>
  );
};

export default Image;
