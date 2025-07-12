"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  copySharedBoardToUser,
  checkIfBoardAlreadyCopied,
} from "@/app/actions/board-copying";
import { getUserFoldersWithBoards } from "@/app/actions/folders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Folder {
  id: string;
  name: string;
}

interface CopyBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicId: string;
  boardName: string;
}

export function CopyBoardModal({
  isOpen,
  onClose,
  publicId,
  boardName,
}: CopyBoardModalProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyCopied, setAlreadyCopied] = useState(false);
  const [isCheckingCopy, setIsCheckingCopy] = useState(false);

  // Load folders when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFolders();
      checkIfAlreadyCopied();
      setCustomName(`${boardName} (Copy)`); // Default name
    }
  }, [isOpen, boardName]);

  const loadFolders = async () => {
    try {
      const result = await getUserFoldersWithBoards();
      if (result.success && result.data) {
        setFolders(result.data);
        // Auto-select first folder if available
        if (result.data.length > 0) {
          setSelectedFolderId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load folders:", error);
      toast.error("Failed to load folders");
    }
  };

  const checkIfAlreadyCopied = async () => {
    try {
      setIsCheckingCopy(true);
      const result = await checkIfBoardAlreadyCopied(publicId);
      if (result.success) {
        setAlreadyCopied(result.data?.alreadyCopied || false);
      }
    } catch (error) {
      console.error("Failed to check copied status:", error);
    } finally {
      setIsCheckingCopy(false);
    }
  };

  const handleCopyBoard = async () => {
    if (!selectedFolderId) {
      toast.error("Please select a folder");
      return;
    }

    if (!customName.trim()) {
      toast.error("Please enter a board name");
      return;
    }

    try {
      setIsLoading(true);
      const result = await copySharedBoardToUser(
        publicId,
        selectedFolderId,
        customName.trim()
      );

      if (result.success) {
        toast.success("Board copied successfully!");
        onClose();
        // Refresh the page to show the new board
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to copy board");
      }
    } catch (error) {
      console.error("Failed to copy board:", error);
      toast.error("Failed to copy board");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedFolderId("");
      setCustomName("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Board to My Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isCheckingCopy ? (
            <div className="text-sm text-muted-foreground">
              Checking copy status...
            </div>
          ) : alreadyCopied ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You have already copied this board to your account.
              </p>
            </div>
          ) : (
            <>
              {/* Board Name Input */}
              <div className="space-y-2">
                <Label htmlFor="board-name">Board Name</Label>
                <Input
                  id="board-name"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Enter board name"
                  disabled={isLoading}
                />
              </div>

              {/* Folder Selection */}
              <div className="space-y-2">
                <Label htmlFor="folder-select">Copy to Folder</Label>
                {folders.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Loading folders...
                  </div>
                ) : (
                  <Select
                    value={selectedFolderId}
                    onValueChange={setSelectedFolderId}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCopyBoard}
                  disabled={
                    isLoading || !selectedFolderId || !customName.trim()
                  }
                >
                  {isLoading ? "Adding..." : "Add to Collection"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
