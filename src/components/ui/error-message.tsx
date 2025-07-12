import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center space-y-4",
        className
      )}
    >
      <div className="p-3 bg-destructive/10 rounded-full">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Page-level error component
export function PageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <ErrorMessage
        title="Page Error"
        message={message}
        {...(onRetry && { onRetry })}
      />
    </div>
  );
}

// Card-level error component
export function CardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-lg card-spacing">
      <ErrorMessage
        title="Failed to load"
        message={message}
        {...(onRetry && { onRetry })}
      />
    </div>
  );
}
