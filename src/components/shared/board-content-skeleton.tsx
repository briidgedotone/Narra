import { Skeleton } from "@/components/ui/skeleton";

export function BoardContentSkeleton() {
  return (
    <div>
      {/* BoardHeader Skeleton */}
      <div className="flex justify-between items-center mb-6 h-10">
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-8">
        {/* Section 1: Board Title and Description Skeleton */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="space-y-2 pl-11">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Section 2: Horizontal Filters Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>

        {/* Section 3: Posts Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="group bg-card rounded-lg border overflow-hidden"
            >
              <div className="relative aspect-[2/3] bg-muted">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
