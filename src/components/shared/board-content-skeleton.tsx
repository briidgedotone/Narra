import { Skeleton } from "@/components/ui/skeleton";

export function BoardContentSkeleton() {
  return (
    <div className="px-[76px] py-[56px] space-y-8">
      {/* Board Title and Description Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Posts Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
