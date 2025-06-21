"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getUserFoldersWithBoards, createBoard, createFolder } from "@/app/actions/folders";
import { savePostToBoard } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Folder, PlusCircle } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
import { Select } from "@/components/ui/select";

interface SavePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    platformPostId: string;
    platform: "tiktok" | "instagram";
    embedUrl: string;
    caption?: string;
    thumbnail: string;
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
  };
}

interface FolderWithBoards {
  id: string;
  name: string;
  boards: Array<{
    id: string;
    name: string;
  }>;
}

export function SavePostModal({ isOpen, onClose, post }: SavePostModalProps) {
  const [folders, setFolders] = useState<FolderWithBoards[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");

  // Load user's folders and boards
  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  const loadFolders = async () => {
    setIsLoading(true);
    try {
      const result = await getUserFoldersWithBoards();
      if (result.success && result.data) {
        setFolders(result.data);
        // Auto-select first board if available
        if (result.data.length > 0 && result.data[0].boards?.length > 0) {
          setSelectedBoardId(result.data[0].boards[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!newBoardName.trim() || !selectedFolderId) {
      toast.error("Please enter a board name and select a folder");
      return;
    }

    setIsSaving(true);
    try {
      // Generate unique board name if needed
      const folder = folders.find(f => f.id === selectedFolderId);
      const existingBoardNames = folder?.boards?.map(b => b.name) || [];
      
      let boardName = newBoardName.trim();
      let counter = 1;
      
      while (existingBoardNames.includes(boardName)) {
        boardName = `${newBoardName.trim()} ${counter}`;
        counter++;
      }

      const result = await createBoard({
        name: boardName,
        folder_id: selectedFolderId,
        description: "",
        is_shared: false,
      });

      if (result.success) {
        toast.success("Board created successfully!");
        setNewBoardName("");
        setShowCreateBoard(false);
        await loadFolders(); // Refresh folders
        if (result.data) {
          setSelectedBoardId(result.data.id);
        }
      } else {
        toast.error(result.error || "Failed to create board");
      }
    } catch (error) {
      console.error("Failed to create board:", error);
      toast.error("Failed to create board");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setIsSaving(true);
    try {
      // Generate unique folder name if needed
      const existingFolderNames = folders.map(f => f.name);
      
      let folderName = newFolderName.trim();
      let counter = 1;
      
      while (existingFolderNames.includes(folderName)) {
        folderName = `${newFolderName.trim()} ${counter}`;
        counter++;
      }

      const result = await createFolder({
        name: folderName,
        description: "",
      });

      if (result.success) {
        toast.success("Folder created successfully!");
        setNewFolderName("");
        setShowCreateFolder(false);
        await loadFolders(); // Refresh folders
      } else {
        toast.error(result.error || "Failed to create folder");
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsSaving(false);
    }
  };

  const allBoards = folders.flatMap(folder => 
    folder.boards?.map(board => ({
      ...board,
      folderName: folder.name,
      folderId: folder.id,
    })) || []
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Post to Board</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Preview */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <img
              src={post.thumbnail}
              alt="Post preview"
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                @{post.handle}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {post.caption || "No caption"}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Board Selection */}
              {!showCreateBoard && !showCreateFolder && (
                <div className="space-y-3">
                  <Label htmlFor="board-select">Select Board</Label>
                  {allBoards.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No boards found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateFolder(true)}
                        className="mt-2"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Folder
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={selectedBoardId}
                      onValueChange={setSelectedBoardId}
                      options={allBoards.map(board => ({
                        value: board.id,
                        label: `${board.name} (in ${board.folderName})`,
                      }))}
                      placeholder="Choose a board..."
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateBoard(true)}
                      className="flex-1"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      New Board
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateFolder(true)}
                      className="flex-1"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      New Folder
                    </Button>
                  </div>
                </div>
              )}

              {/* Create Board Form */}
              {showCreateBoard && (
                <div className="space-y-3">
                  <Label htmlFor="board-name">Create New Board</Label>
                  <Input
                    id="board-name"
                    placeholder="Board name..."
                    value={newBoardName}
                    onChange={e => setNewBoardName(e.target.value)}
                  />
                  <Select
                    value={selectedFolderId}
                    onValueChange={setSelectedFolderId}
                    options={folders.map(folder => ({
                      value: folder.id,
                      label: folder.name,
                    }))}
                    placeholder="Select folder..."
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateBoard(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateBoard}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Create Board
                    </Button>
                  </div>
                </div>
              )}

              {/* Create Folder Form */}
              {showCreateFolder && (
                <div className="space-y-3">
                  <Label htmlFor="folder-name">Create New Folder</Label>
                  <Input
                    id="folder-name"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateFolder(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateFolder}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Create Folder
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Save Button */}
          {!showCreateBoard && !showCreateFolder && !isLoading && (
            <div className="flex space-x-2 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSavePost}
                disabled={isSaving || !selectedBoardId}
                className="flex-1"
              >
                {isSaving ? <LoadingSpinner /> : "Save Post"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 