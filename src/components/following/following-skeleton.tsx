import { Skeleton } from "@/components/ui/skeleton";

export function FollowingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Profiles Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-4">
            {/* Profile Header */}
            <div className="flex items-start space-x-3">
              <div className="relative">
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>

            {/* Follow Info */}
            <div className="space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Notice skeleton */}
      <div className="mt-8 p-4 border rounded-lg space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
