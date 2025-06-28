"use client";

import { useState, useEffect } from "react";

import { getAdminBoards, setFeaturedBoard } from "@/app/actions/folders";
import { Button } from "@/components/ui/button";
import { X } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

interface Board {
  id: string;
  name: string;
  description?: string;
  postCount: number;
  folders: { name: string };
  created_at: string;
}

interface BoardSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayOrder: number;
  onSuccess: () => void;
}

export function BoardSelectionModal({
  isOpen,
  onClose,
  displayOrder,
  onSuccess,
}: BoardSelectionModalProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadBoards();
    }
  }, [isOpen]);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const result = await getAdminBoards();
      if (result.success && result.data) {
        setBoards(result.data);
      }
    } catch (error) {
      console.error("Failed to load boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = (board: Board) => {
    setSelectedBoard(board);
    setCustomTitle(board.name);
    setCustomDescription(board.description || "");
  };

  const handleSave = async () => {
    if (!selectedBoard || !coverImageUrl) return;

    setLoading(true);
    try {
      const result = await setFeaturedBoard(
        selectedBoard.id,
        displayOrder,
        coverImageUrl,
        customTitle,
        customDescription
      );

      if (result.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to set featured board:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Select Board for Featured Collection {displayOrder}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!selectedBoard ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Choose a Board</h3>
            {loading ? (
              <div className="text-center py-8">Loading boards...</div>
            ) : boards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No boards found. Create some boards first.
              </div>
            ) : (
              <div className="grid gap-3">
                {boards.map(board => (
                  <div
                    key={board.id}
                    onClick={() => handleBoardSelect(board)}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{board.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {board.folders.name}
                        </p>
                        {board.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {board.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {board.postCount} posts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Configure Featured Board</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBoard(null)}
              >
                Back to selection
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{selectedBoard.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedBoard.folders.name} • {selectedBoard.postCount} posts
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cover Image URL *
                </label>
                <Input
                  value={coverImageUrl}
                  onChange={e => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Custom Title
                </label>
                <Input
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Custom title for featured display"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Custom Description
                </label>
                <Input
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  placeholder="Custom description for featured display"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!coverImageUrl || loading}>
                {loading ? "Saving..." : "Save Featured Board"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
