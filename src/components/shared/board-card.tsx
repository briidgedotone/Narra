"use client";

import {
  Eye,
  Share2,
  Edit,
  Trash2,
  Lock,
  Globe,
  Calendar,
  Hash,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMetric } from "@/lib/utils/format";
import type { Board } from "@/types/content";

interface BoardCardProps {
  board: Board;
  onView?: (board: Board) => void;
  onShare?: (board: Board) => void;
  onEdit?: (board: Board) => void;
  onDelete?: (board: Board) => void;
  variant?: "grid" | "list" | "compact";
  className?: string;
  showActions?: boolean;
}

export function BoardCard({
  board,
  onView,
  onShare,
  onEdit,
  onDelete,
  variant = "grid",
  showActions = true,
  className,
}: BoardCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleView = () => {
    onView?.(board);
  };

  const handleShare = () => {
    onShare?.(board);
  };

  const handleEdit = () => {
    onEdit?.(board);
  };

  const handleDelete = () => {
    onDelete?.(board);
  };

  // Compact variant for smaller spaces
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 bg-card rounded-lg border",
          "hover:shadow-sm transition-shadow",
          className
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
            <Hash className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{board.name}</span>
              {board.isPublic ? (
                <Globe className="w-3 h-3 text-muted-foreground" />
              ) : (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatMetric(board.postCount)} posts
            </p>
          </div>
        </div>

        {showActions && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleView}
            className="min-w-16"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
        )}
      </div>
    );
  }

  // List variant for table-like display
  if (variant === "list") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-4 bg-card rounded-lg border",
          "hover:shadow-sm transition-shadow",
          className
        )}
      >
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
            {board.coverImage ? (
              <img
                src={board.coverImage}
                alt={board.name}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <Hash className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium truncate">{board.name}</h3>
              {board.isPublic ? (
                <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
              ) : (
                <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
              )}
            </div>
            {board.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                {board.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{formatMetric(board.postCount)} posts</span>
              <span>
                Updated {new Date(board.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-1 shrink-0">
            <Button size="sm" variant="ghost" onClick={handleView}>
              <Eye className="w-3 h-3" />
            </Button>
            {board.isPublic && (
              <Button size="sm" variant="ghost" onClick={handleShare}>
                <Share2 className="w-3 h-3" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Grid variant (default) - card layout
  return (
    <div
      className={cn(
        "bg-card rounded-lg border overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleView}
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] bg-muted">
        {board.coverImage ? (
          <img
            src={board.coverImage}
            alt={board.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="text-center">
              <Hash className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {formatMetric(board.postCount)} posts
              </p>
            </div>
          </div>
        )}

        {/* Privacy Badge */}
        <div className="absolute top-2 right-2">
          <div className="px-2 py-1 bg-black/50 rounded-md text-xs text-white font-medium">
            {board.isPublic ? (
              <>
                <Globe className="w-3 h-3 inline mr-1" />
                Public
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 inline mr-1" />
                Private
              </>
            )}
          </div>
        </div>

        {/* Hover Actions */}
        {isHovered && showActions && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-2 transition-opacity duration-200">
            <Button
              size="sm"
              variant="secondary"
              onClick={e => {
                e.stopPropagation();
                handleView();
              }}
              className="bg-background/90 hover:bg-background"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            {board.isPublic && (
              <Button
                size="sm"
                variant="secondary"
                onClick={e => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="bg-background/90 hover:bg-background"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Board Info */}
      <div className="p-4 space-y-3">
        {/* Title and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{board.name}</h3>
            {board.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {board.description}
              </p>
            )}
          </div>

          {showActions && (
            <div className="flex items-center space-x-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={e => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="h-6 w-6 p-0"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={e => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Hash className="w-3 h-3" />
            <span>{formatMetric(board.postCount)} posts</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>
              Updated {new Date(board.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
