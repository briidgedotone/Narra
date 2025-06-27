import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="space-y-2">
      {/* Generate 2-3 folder skeletons */}
      {[...Array(3)].map((_, folderIndex) => {
        const isExpanded = folderIndex < 2; // Show first 2 folders as expanded
        const boardCount = folderIndex === 0 ? 3 : folderIndex === 1 ? 2 : 1; // Vary board counts

        return (
          <div key={folderIndex} className="space-y-1">
            {/* Folder Header Skeleton */}
            <div className="flex items-center px-2 py-1.5 rounded-md">
              {/* Folder icon */}
              <Skeleton className="h-5 w-5 mr-2 flex-shrink-0 rounded" />

              {/* Folder name */}
              <Skeleton
                className={`h-4 flex-1 rounded ${
                  folderIndex === 0
                    ? "w-20"
                    : folderIndex === 1
                      ? "w-24"
                      : "w-16"
                }`}
              />

              {/* Chevron icon */}
              <div className="ml-3 relative w-4 h-4 flex items-center justify-center">
                <Skeleton className="h-4 w-4 rounded" />
              </div>

              {/* Plus button */}
              <div className="ml-1">
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </div>

            {/* Boards List Skeleton (only if expanded) */}
            {isExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {[...Array(boardCount)].map((_, boardIndex) => (
                  <div
                    key={boardIndex}
                    className="flex items-center px-2 py-1 rounded-md"
                  >
                    {/* Board icon */}
                    <Skeleton className="h-5 w-5 mr-2 flex-shrink-0 rounded opacity-60" />

                    {/* Board name - vary lengths for realism */}
                    <Skeleton
                      className={`h-4 rounded ${
                        boardIndex === 0
                          ? "w-28"
                          : boardIndex === 1
                            ? "w-20"
                            : boardIndex === 2
                              ? "w-24"
                              : "w-16"
                      }`}
                    />

                    {/* Three dots menu (subtle) */}
                    <div className="ml-auto">
                      <Skeleton className="h-4 w-4 rounded opacity-30" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add a subtle loading indicator at the bottom */}
      <div className="px-2 py-2 flex items-center justify-center">
        <div className="flex space-x-1">
          <Skeleton className="h-1 w-1 rounded-full animate-pulse" />
          <Skeleton
            className="h-1 w-1 rounded-full animate-pulse"
            style={{ animationDelay: "0.1s" }}
          />
          <Skeleton
            className="h-1 w-1 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  );
}
