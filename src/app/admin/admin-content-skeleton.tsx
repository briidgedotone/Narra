import { Skeleton } from "@/components/ui/skeleton";

export function AdminContentSkeleton() {
  return (
    <div className="flex-1 space-y-4">
      {/* Title Skeleton */}
      <div className="flex items-center justify-between space-y-2 mb-4">
        <Skeleton className="h-7 w-48" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />

        {/* Overview Tab Skeleton */}
        <div className="space-y-4">
          {/* Stat Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
            <Skeleton className="h-[126px] w-full" />
          </div>

          {/* Featured Boards Section Skeleton */}
          <div>
            <Skeleton className="h-6 w-56 mb-4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-9 w-40" />
                  <Skeleton className="h-[178px] w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
