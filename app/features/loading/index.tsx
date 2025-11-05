import React from "react";
import { cn } from "~/lib/utils";

interface GlobalLoaderProps {
  /**
   * Loader variant
   * @default "spinner"
   */
  variant?: "spinner" | "dots" | "pulse" | "wave" | "skeleton";
  /**
   * Size of the loader
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Full screen overlay
   * @default true
   */
  fullScreen?: boolean;
  /**
   * Custom text to display below loader
   */
  text?: string;
  /**
   * Custom className
   */
  className?: string;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  variant = "spinner",
  size = "md",
  fullScreen = true,
  text,
  className,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <div className="relative">
            <div
              className={cn(
                "border-4 border-primary/20 border-t-primary rounded-full animate-spin",
                sizeClasses[size]
              )}
            />
          </div>
        );

      case "dots":
        return (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-primary rounded-full animate-bounce",
                  size === "sm" && "w-2 h-2",
                  size === "md" && "w-3 h-3",
                  size === "lg" && "w-4 h-4"
                )}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div className="relative">
            <div
              className={cn(
                "bg-primary rounded-full animate-ping absolute opacity-75",
                sizeClasses[size]
              )}
            />
            <div
              className={cn(
                "bg-primary rounded-full relative",
                sizeClasses[size]
              )}
            />
          </div>
        );

      case "wave":
        return (
          <div className="flex items-end gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-primary rounded-sm animate-wave",
                  size === "sm" && "w-1",
                  size === "md" && "w-1.5",
                  size === "lg" && "w-2"
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height:
                    size === "sm" ? "16px" : size === "md" ? "24px" : "32px",
                }}
              />
            ))}
          </div>
        );

      case "skeleton":
        return (
          <div className="space-y-3">
            <div
              className={cn(
                "bg-muted rounded-md animate-pulse",
                size === "sm" && "h-16 w-48",
                size === "md" && "h-20 w-64",
                size === "lg" && "h-24 w-80"
              )}
            />
            <div
              className={cn(
                "bg-muted rounded-md animate-pulse",
                size === "sm" && "h-12 w-40",
                size === "md" && "h-16 w-56",
                size === "lg" && "h-20 w-72"
              )}
            />
            <div
              className={cn(
                "bg-muted rounded-md animate-pulse",
                size === "sm" && "h-12 w-36",
                size === "md" && "h-16 w-48",
                size === "lg" && "h-20 w-64"
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const loaderContent = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      {renderLoader()}
      {text && (
        <p
          className={cn(
            "text-muted-foreground font-medium animate-pulse",
            size === "sm" && "text-sm",
            size === "md" && "text-base",
            size === "lg" && "text-lg"
          )}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default GlobalLoader;

// Export individual loader components for specific use cases
export const SpinnerLoader: React.FC<Omit<GlobalLoaderProps, "variant">> = (
  props
) => <GlobalLoader {...props} variant="spinner" />;

export const DotsLoader: React.FC<Omit<GlobalLoaderProps, "variant">> = (
  props
) => <GlobalLoader {...props} variant="dots" />;

export const PulseLoader: React.FC<Omit<GlobalLoaderProps, "variant">> = (
  props
) => <GlobalLoader {...props} variant="pulse" />;

export const WaveLoader: React.FC<Omit<GlobalLoaderProps, "variant">> = (
  props
) => <GlobalLoader {...props} variant="wave" />;

export const SkeletonLoader: React.FC<Omit<GlobalLoaderProps, "variant">> = (
  props
) => <GlobalLoader {...props} variant="skeleton" />;
