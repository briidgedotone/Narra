"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { savePostToBoard, checkPostInUserBoards } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, PlusCircle, Folder, Check } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { useFolders } from "@/hooks/useFolders";
import { cn } from "@/lib/utils";

interface SavePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    platformPostId: string;
    platform: "tiktok" | "instagram";
    embedUrl: string;
    caption?: string;
    originalUrl?: string;
    metrics: {
      views?: number;
      likes: number;
      comments: number;
      shares?: number;
    };
    datePosted: string;
    handle: string;
    displayName?: string;
    bio?: string;
    followers?: number;
    avatarUrl?: string;
    verified?: boolean;
    // Instagram-specific fields
    thumbnail?: string;
    isVideo?: boolean;
    isCarousel?: boolean;
    carouselMedia?: Array<{
      id: string;
      type: "image" | "video";
      url: string;
      thumbnail: string;
      isVideo: boolean;
    }>;
    carouselCount?: number;
    videoUrl?: string;
    displayUrl?: string;
    shortcode?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    transcript?: string;
  };
}

export function SavePostModal({ isOpen, onClose, post }: SavePostModalProps) {
  const { folders, createNewBoard } = useFolders();
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [boardsWithPost, setBoardsWithPost] = useState<string[]>([]);

  // Reset state when modal opens and check which boards contain this post
  useEffect(() => {
    if (isOpen) {
      setSelectedBoardId("");
      setShowCreateBoard(false);
      setNewBoardName("");
      setSearchQuery("");
      setBoardsWithPost([]);

      // Check which boards already contain this post
      const checkExistingBoards = async () => {
        try {
          const result = await checkPostInUserBoards(
            post.platformPostId,
            post.platform
          );
          if (result.success && result.data) {
            setBoardsWithPost(
              result.data.map((board: { boardId: string }) => board.boardId)
            );
          }
        } catch (error) {
          console.error("Failed to check existing boards:", error);
        }
      };

      checkExistingBoards();
    }
  }, [isOpen, post.platformPostId, post.platform]);

  const handleSavePost = async () => {
    if (!selectedBoardId) {
      toast.error("Please select a board");
      return;
    }

    setIsSaving(true);
    try {
      const result = await savePostToBoard(post, selectedBoardId);
      if (result.success) {
        toast.success("Post saved successfully!");
        onClose();
      } else {
        toast.error(result.error || "Failed to save post");
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      toast.error("Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      toast.error("Please enter a board name");
      return;
    }

    setIsSaving(true);
    try {
      // Use the first folder if available, or create in default folder
      const firstFolderId = folders[0]?.id;
      if (!firstFolderId) {
        toast.error("No folders available");
        return;
      }

      const result = await createNewBoard(firstFolderId, newBoardName.trim());
      if (result) {
        setNewBoardName("");
        setShowCreateBoard(false);
        setSelectedBoardId(result.id);
        toast.success(`Board "${newBoardName.trim()}" created!`);
      }
    } catch (error) {
      console.error("Failed to create board:", error);
      toast.error("Failed to create board");
    } finally {
      setIsSaving(false);
    }
  };

  // Get all boards with folder info
  const allBoards = folders.flatMap(
    folder =>
      folder.boards?.map(board => ({
        ...board,
        folderName: folder.name,
        folderId: folder.id,
      })) || []
  );

  // Filter boards based on search query
  const filteredBoards = allBoards.filter(
    board =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.folderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Save to Board
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Preview */}
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs font-medium text-muted-foreground">
              {post.platform === "tiktok" ? "TT" : "IG"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">@{post.handle}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {post.caption || "No caption available"}
              </p>
            </div>
          </div>

          {/* Search Bar with Create Button */}
          {!showCreateBoard && allBoards.length > 0 && (
            <div className="flex gap-2">
              {allBoards.length > 3 ? (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search boards..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              ) : (
                <div className="flex-1" />
              )}
              <Button
                variant="outline"
                onClick={() => setShowCreateBoard(true)}
                size="sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
          )}

          {/* Create Board Form */}
          {showCreateBoard && (
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Create Board</span>
              </div>
              <Input
                placeholder="Board name"
                value={newBoardName}
                onChange={e => setNewBoardName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreateBoard()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateBoard(false)}
                  className="flex-1"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBoard}
                  disabled={isSaving || !newBoardName.trim()}
                  className="flex-1"
                  size="sm"
                >
                  {isSaving ? <LoadingSpinner className="w-4 h-4" /> : "Create"}
                </Button>
              </div>
            </div>
          )}

          {/* Boards List */}
          {!showCreateBoard && (
            <div className="space-y-2">
              {allBoards.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto">
                    <Folder className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">No boards yet</p>
                    <p className="text-xs text-muted-foreground">
                      Create your first board to save posts
                    </p>
                  </div>
                  <Button onClick={() => setShowCreateBoard(true)} size="sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Board
                  </Button>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredBoards.map(board => {
                    const isAlreadySaved = boardsWithPost.includes(board.id);
                    return (
                      <button
                        key={board.id}
                        onClick={() => !isAlreadySaved && setSelectedBoardId(board.id)}
                        disabled={isAlreadySaved}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                          selectedBoardId === board.id
                            ? "bg-primary/5 border-primary"
                            : isAlreadySaved
                              ? "bg-muted/30 border-muted cursor-not-allowed opacity-60"
                              : "hover:bg-muted/50 cursor-pointer"
                        )}
                      >
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <Folder className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {board.name}
                            </p>
                            {isAlreadySaved && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                                Saved
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {board.folderName}
                          </p>
                        </div>
                        {selectedBoardId === board.id && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        {isAlreadySaved && selectedBoardId !== board.id && (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {!showCreateBoard && allBoards.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePost}
              disabled={isSaving || !selectedBoardId}
              className="flex-1"
              size="sm"
            >
              {isSaving ? <LoadingSpinner className="w-4 h-4" /> : "Save"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
