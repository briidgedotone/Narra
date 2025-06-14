import { Loader2 } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({ size = "md", text, className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2
          className={cn(
            "animate-spin text-muted-foreground",
            sizeClasses[size]
          )}
        />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}

// Inline loading spinner for buttons and small spaces
export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

// Page-level loading component
export function PageLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loading size="lg" text="Loading page..." />
    </div>
  );
}

// Card-level loading component
export function CardLoading() {
  return (
    <div className="bg-card border border-border rounded-lg card-spacing">
      <Loading text="Loading content..." />
    </div>
  );
}
