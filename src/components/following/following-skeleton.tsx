"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FollowingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Section Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Profiles Grid Skeleton - 7 columns on large screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-6">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center text-center p-2">
            {/* Avatar */}
            <div className="relative mb-3">
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
            {/* Handle */}
            <Skeleton className="h-4 w-16 mb-1" />
            {/* Platform badge */}
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>

      {/* Posts Section Skeleton */}
      <div className="space-y-6">
        {/* Posts header with filters */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-48" />
          </div>
          
          {/* Filter dropdowns */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>

        {/* Masonry Posts Grid Skeleton */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="break-inside-avoid mb-4 bg-white rounded-xl border overflow-hidden"
            >
              {/* Post embed area */}
              <Skeleton 
                className="w-full rounded-t-xl" 
                style={{ 
                  aspectRatio: i % 3 === 0 ? '9/16' : i % 3 === 1 ? '4/5' : '1/1',
                  height: 'auto'
                }} 
              />
              
              {/* Post info section */}
              <div className="p-4 space-y-3">
                {/* Profile info */}
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                
                {/* Caption */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                
                {/* Metrics */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}