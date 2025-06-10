"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Board data interface
export interface BoardData {
  id: string;
  name: string;
  description?: string;
  postCount: number;
  isPublic: boolean;
  previewPosts?: {
    id: string;
    thumbnail?: string;
    platform: "tiktok" | "instagram";
  }[];
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  folderName?: string;
}

// Main Board Card Component
interface BoardCardProps {
  board: BoardData;
  onViewBoard?: (board: BoardData) => void;
  onEditBoard?: (board: BoardData) => void;
  onShareBoard?: (board: BoardData) => void;
  onDeleteBoard?: (board: BoardData) => void;
  variant?: "default" | "compact";
  className?: string;
  showActions?: boolean;
  loading?: boolean;
}

export function BoardCard({
  board,
  onViewBoard,
  onEditBoard,
  onShareBoard,
  onDeleteBoard,
  variant = "default",
  className,
  showActions = true,
  loading = false,
}: BoardCardProps) {
  if (loading) {
    return <BoardCardSkeleton variant={variant} className={className} />;
  }

  // Compact variant for lists
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3 rounded-lg bg-background border border-border hover:shadow-sm transition-all duration-200 cursor-pointer",
          className
        )}
        onClick={() => onViewBoard?.(board)}
      >
        <BoardPreview posts={board.previewPosts} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-sm truncate">{board.name}</h3>
            {board.isPublic && <PublicBadge size="sm" />}
          </div>
          <p className="text-xs text-muted-foreground">
            {board.postCount} posts
            {board.folderName && ` • ${board.folderName}`}
          </p>
        </div>

        {showActions && (
          <BoardActions
            board={board}
            onEdit={onEditBoard}
            onShare={onShareBoard}
            onDelete={onDeleteBoard}
            size="sm"
          />
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "bg-background border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group",
        className
      )}
      onClick={() => onViewBoard?.(board)}
    >
      {/* Preview Section */}
      <div className="relative">
        <BoardPreview posts={board.previewPosts} size="lg" />

        {/* Overlay with actions */}
        {showActions && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <BoardActions
              board={board}
              onEdit={onEditBoard}
              onShare={onShareBoard}
              onDelete={onDeleteBoard}
            />
          </div>
        )}

        {/* Public badge */}
        {board.isPublic && (
          <div className="absolute top-2 left-2">
            <PublicBadge />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg truncate">{board.name}</h3>
          {board.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {board.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center space-x-2">
            <span>{board.postCount} posts</span>
            {board.folderName && (
              <>
                <span>•</span>
                <span>{board.folderName}</span>
              </>
            )}
          </div>
          <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// Board Preview Component
interface BoardPreviewProps {
  posts?: BoardData["previewPosts"];
  size?: "sm" | "lg";
  className?: string;
}

export function BoardPreview({
  posts = [],
  size = "lg",
  className,
}: BoardPreviewProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    lg: "w-full h-32",
  };

  const maxPosts = size === "sm" ? 1 : 4;
  const displayPosts = posts.slice(0, maxPosts);

  if (displayPosts.length === 0) {
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center rounded-md",
          sizeClasses[size],
          className
        )}
      >
        <EmptyBoardIcon className={size === "sm" ? "w-4 h-4" : "w-8 h-8"} />
      </div>
    );
  }

  if (size === "sm" || displayPosts.length === 1) {
    const post = displayPosts[0];
    return (
      <div
        className={cn(
          "relative rounded-md overflow-hidden",
          sizeClasses[size],
          className
        )}
      >
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt="Board preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">
              {post.platform === "tiktok" ? "TT" : "IG"}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Grid layout for multiple posts
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1 rounded-md overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {displayPosts.map((post, index) => (
        <div key={post.id} className="relative bg-muted">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">
                {post.platform === "tiktok" ? "TT" : "IG"}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Fill empty slots */}
      {Array.from({ length: maxPosts - displayPosts.length }).map(
        (_, index) => (
          <div key={`empty-${index}`} className="bg-muted/50" />
        )
      )}
    </div>
  );
}

// Public Badge Component
interface PublicBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function PublicBadge({ size = "md", className }: PublicBadgeProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs",
  };

  return (
    <div
      className={cn(
        "bg-green-100 text-green-800 rounded-md font-medium",
        sizeClasses[size],
        className
      )}
    >
      Public
    </div>
  );
}

// Board Actions Component
interface BoardActionsProps {
  board: BoardData;
  onEdit?: (board: BoardData) => void;
  onShare?: (board: BoardData) => void;
  onDelete?: (board: BoardData) => void;
  size?: "sm" | "md";
}

export function BoardActions({
  board,
  onEdit,
  onShare,
  onDelete,
  size = "md",
}: BoardActionsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const buttonSize = size === "sm" ? "sm" : "sm";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={e => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="bg-background/80 backdrop-blur-sm hover:bg-background"
      >
        <MoreIcon className={iconSize} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-border rounded-md shadow-lg py-1 min-w-[120px]">
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
              onClick={e => {
                e.stopPropagation();
                onEdit?.(board);
                setIsOpen(false);
              }}
            >
              <EditIcon className="w-3 h-3" />
              <span>Edit</span>
            </button>

            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
              onClick={e => {
                e.stopPropagation();
                onShare?.(board);
                setIsOpen(false);
              }}
            >
              <ShareIcon className="w-3 h-3" />
              <span>Share</span>
            </button>

            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-destructive flex items-center space-x-2"
              onClick={e => {
                e.stopPropagation();
                onDelete?.(board);
                setIsOpen(false);
              }}
            >
              <DeleteIcon className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Board Card Skeleton
export function BoardCardSkeleton({
  variant = "default",
  className,
}: {
  variant?: BoardCardProps["variant"];
  className?: string | undefined;
}) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center space-x-3 p-3 rounded-lg bg-background border border-border",
          className
        )}
      >
        <div className="w-12 h-12 bg-muted rounded-md animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className="w-24 h-3 bg-muted rounded animate-pulse" />
          <div className="w-16 h-2 bg-muted rounded animate-pulse" />
        </div>
        <div className="w-6 h-6 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-background border border-border rounded-lg overflow-hidden",
        className
      )}
    >
      <div className="w-full h-32 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="w-32 h-4 bg-muted rounded animate-pulse" />
          <div className="w-full h-8 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="w-20 h-3 bg-muted rounded animate-pulse" />
          <div className="w-16 h-3 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Icons
const EmptyBoardIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);

const MoreIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
);

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
