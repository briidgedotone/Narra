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
  folders?: { name: string } | null;
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
      // Reset form when modal opens
      setSelectedBoard(null);
      setCustomTitle("");
      setCustomDescription("");
      setCoverImageUrl("");
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
                    onClick={() => setSelectedBoard(board)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBoard?.id === board.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{board.name}</h3>
                        <p className="text-sm text-gray-500">
                          Folder: {board.folders?.name || "No folder"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {board.postCount} posts
                        </p>
                      </div>
                      {selectedBoard?.id === board.id && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
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
                {selectedBoard.folders?.name || "No folder"} •{" "}
                {selectedBoard.postCount} posts
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
