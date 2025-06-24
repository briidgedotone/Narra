"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function BoardCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card rounded-lg border overflow-hidden", className)}>
      {/* Cover Image Skeleton */}
      <Skeleton className="aspect-[4/3] w-full" />

      {/* Card Content Skeleton */}
      <div className="p-4">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );
}
