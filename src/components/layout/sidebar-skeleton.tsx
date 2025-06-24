import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="px-2 py-4 space-y-3">
      {/* Folder skeletons */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          {/* Folder header */}
          <div className="flex items-center px-2 py-1.5">
            <Skeleton className="h-5 w-5 mr-2" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-4 ml-2" />
          </div>

          {/* Board items under folder */}
          <div className="ml-6 space-y-1">
            <div className="flex items-center px-2 py-1">
              <Skeleton className="h-5 w-5 mr-2" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <div className="flex items-center px-2 py-1">
              <Skeleton className="h-5 w-5 mr-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
