"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SavedPostsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Platform and Date Filters Section Skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Platform Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`flex items-center gap-2 h-10 px-4 rounded-md border ${i === 0 ? 'bg-primary/10' : 'bg-background'}`}>
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Date and Sort Filter dropdowns */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-background w-[180px]">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-background w-[180px]">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Posts Masonry Grid Skeleton */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="break-inside-avoid mb-4 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            {/* Instagram/TikTok Embed Area */}
            <div className="relative">
              <Skeleton 
                className="w-full rounded-t-xl" 
                style={{ 
                  aspectRatio: i % 4 === 0 ? '9/16' : i % 4 === 1 ? '4/5' : i % 4 === 2 ? '1/1' : '3/4',
                  height: 'auto'
                }} 
              />
              
              {/* Action Buttons Overlay */}
              <div className="absolute top-2 right-2 flex gap-1">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>
            
            {/* Post Information Section */}
            <div className="p-4 space-y-3">
              {/* Profile Section */}
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              
              {/* Caption */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              
              {/* Metrics Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Likes */}
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  {/* Comments */}
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  {/* Views (randomly show for some) */}
                  {i % 3 === 0 && (
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  )}
                </div>
                {/* Date */}
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}