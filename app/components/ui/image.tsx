import { ImageOff, Loader2 } from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  type ComponentProps,
} from "react";
import { cn } from "~/lib/utils";
import { Skeleton } from "./skeleton";

interface ImageProps {
  /**
   * Image source URL
   */
  src: string;
  /**
   * Alternative text for accessibility
   */
  alt?: string;
  /**
   * Width of the image container (in pixels)
   */
  width?: number;
  /**
   * Height of the image container (in pixels)
   */
  height?: number;
  /**
   * Fallback image URL to display on error
   */
  fallbackSrc?: string;
  /**
   * Custom error placeholder component
   */
  errorPlaceholder?: React.ReactNode;
  /**
   * Custom loading placeholder component
   */
  loadingPlaceholder?: React.ReactNode;
  /**
   * Object fit style for the image
   * @default "cover"
   */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /**
   * Border radius variant
   * @default "md"
   */
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /**
   * Aspect ratio constraint (e.g., "16/9", "4/3", "1/1")
   */
  aspectRatio?: string;
  /**
   * Enable zoom on hover
   * @default false
   */
  zoomOnHover?: boolean;
  /**
   * Show loading spinner instead of skeleton
   * @default false
   */
  showSpinner?: boolean;
  /**
   * Callback when image loads successfully
   */
  onLoadSuccess?: () => void;
  /**
   * Callback when image fails to load
   */
  onLoadError?: () => void;
  /**
   * @deprecated Use errorPlaceholder prop instead
   */
  undefined?: boolean;
  /**
   * @deprecated Not used anymore
   */
  addBaseUrl?: boolean;
}

const Image = forwardRef<HTMLImageElement, ComponentProps<"img"> & ImageProps>(
  (
    {
      src,
      alt = "image",
      className,
      width,
      height,
      style,
      fallbackSrc,
      errorPlaceholder,
      loadingPlaceholder,
      objectFit = "cover",
      rounded = "md",
      aspectRatio,
      zoomOnHover = false,
      showSpinner = false,
      onLoadSuccess,
      onLoadError,
      undefined: isUndefined,
      ...props
    },
    ref
  ) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string>(src);

    useEffect(() => {
      if (src) {
        setLoading(true);
        setError(false);
        setCurrentSrc(src);
      }
    }, [src]);

    const handleLoad = useCallback(() => {
      setLoading(false);
      setError(false);
      onLoadSuccess?.();
    }, [onLoadSuccess]);

    const handleError = useCallback(() => {
      setLoading(false);
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        // Try fallback image
        setCurrentSrc(fallbackSrc);
        setError(false);
      } else {
        setError(true);
        onLoadError?.();
      }
    }, [fallbackSrc, currentSrc, onLoadError]);

    // Map rounded values to Tailwind classes
    const roundedClass = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      full: "rounded-full",
    }[rounded];

    // Map object-fit values to Tailwind classes
    const objectFitClass = {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
      none: "object-none",
      "scale-down": "object-scale-down",
    }[objectFit];

    // Container styles
    const containerStyle: React.CSSProperties = {
      width,
      height,
      aspectRatio,
      ...style,
    };

    // Error state (including deprecated undefined prop)
    if (isUndefined || error) {
      if (errorPlaceholder) {
        return <div style={containerStyle}>{errorPlaceholder}</div>;
      }

      return (
        <div
          style={containerStyle}
          className={cn(
            "flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground",
            roundedClass,
            className
          )}
        >
          <ImageOff className="h-6 w-6" />
        </div>
      );
    }
    return (
      <div
        style={containerStyle}
        className={cn("relative overflow-hidden", roundedClass, className)}
      >
        {/* Loading state */}
        {loading && (
          <>
            {loadingPlaceholder ? (
              loadingPlaceholder
            ) : showSpinner ? (
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center bg-muted",
                  roundedClass
                )}
              >
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Skeleton
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  roundedClass
                )}
              >
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </Skeleton>
            )}
          </>
        )}

        {/* Image */}
        <img
          ref={ref}
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          className={cn(
            "h-full w-full transition-all duration-300",
            objectFitClass,
            roundedClass,
            {
              "opacity-0": loading,
              "opacity-100": !loading,
              "hover:scale-110": zoomOnHover && !loading,
            }
          )}
          style={{
            width: "100%",
            height: "100%",
          }}
          {...props}
        />
      </div>
    );
  }
);

Image.displayName = "Image";

export default Image;
export { Image };
