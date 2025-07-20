"use client";

import { useState } from "react";
import { toast } from "sonner";

import { enableBoardSharing } from "@/app/actions/folders";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/icons";

import { CopyBoardButton } from "./copy-board-button";

interface BoardHeaderProps {
  boardName: string;
  boardId: string;
  isSharedView?: boolean;
  publicId?: string;
}

export function BoardHeader({
  boardName,
  boardId,
  isSharedView = false,
  publicId,
}: BoardHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyLink = async () => {
    try {
      setIsLoading(true);

      // Enable sharing and get public ID
      const result = await enableBoardSharing(boardId);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Copy the public URL
      if (!result.data?.public_id) {
        throw new Error("No public ID returned");
      }
      const url = `${window.location.origin}/shared/${result.data.public_id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Board link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="h-14 sticky top-0 z-10">
      <div className="flex items-center justify-between h-full">
        {/* Left side - Board name */}
        <div className="flex items-center pl-6">
          <h1 className="text-sm font-medium text-foreground truncate max-w-md">
            {boardName}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2 pr-6">
          {isSharedView && publicId ? (
            /* Copy Board Button for shared views */
            <CopyBoardButton
              publicId={publicId}
              boardName={boardName}
              className="h-8"
            />
          ) : (
            /* Original buttons for owned boards */
            <>
              {/* Copy Link Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                disabled={isLoading}
                className="h-8"
              >
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
