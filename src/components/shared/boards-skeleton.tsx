"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BoardsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Section Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Sidebar - Folder Navigation Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-lg border p-3 sm:p-4">
            <Skeleton className="h-6 w-16 mb-3" />
            <div className="space-y-1">
              {/* "All Boards" button */}
              <div className="bg-primary/10 rounded-md p-3">
                <Skeleton className="h-4 w-24" />
              </div>
              
              {/* Folder items */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  {/* Folder header */}
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                  
                  {/* Expanded folder contents (show for first 2) */}
                  {i < 2 && (
                    <div className="ml-4 space-y-1">
                      {Array.from({ length: 2 + i }).map((_, j) => (
                        <Skeleton key={j} className="h-3 w-20" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Boards Grid Skeleton */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-card rounded-lg border overflow-hidden"
              >
                {/* Cover Image Area */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <Skeleton className="w-8 h-8 mx-auto" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  {/* Title and Privacy Icon */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 flex-1 mr-2" />
                    <Skeleton className="w-4 h-4" />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>

                  {/* Footer with metrics and date */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>

                {/* Action Buttons Overlay (appears on hover) */}
                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-8 h-8 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}