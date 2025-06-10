import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "./button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showIcon?: boolean;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  showIcon = true,
}: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        {showIcon && (
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        )}
        <div className="space-y-2">
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-small max-w-md">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
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
      <ErrorMessage title="Page Error" message={message} onRetry={onRetry} />
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
        onRetry={onRetry}
        showIcon={false}
      />
    </div>
  );
}
