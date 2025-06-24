import { Skeleton } from "@/components/ui/skeleton";

export function BoardsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-lg border p-4">
            <Skeleton className="h-5 w-16 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                  {/* Nested board items */}
                  <div className="ml-4 space-y-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Boards Grid Skeleton */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border p-4 space-y-3">
                {/* Board thumbnail */}
                <Skeleton className="h-32 w-full rounded-md" />
                {/* Board title */}
                <Skeleton className="h-5 w-3/4" />
                {/* Board description */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                {/* Board stats */}
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
