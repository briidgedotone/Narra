import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ size = "md", text = "Loading..." }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div className="flex items-center space-x-2">
        <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
        <span className="text-muted-foreground">{text}</span>
      </div>
    </div>
  );
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
