"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Link, Menu } from "@/components/ui/icons";

interface BoardHeaderProps {
  boardName: string;
  boardId: string;
}

export function BoardHeader({ boardName, boardId }: BoardHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyLink = async () => {
    try {
      setIsLoading(true);
      const url = `${window.location.origin}/boards/${boardId}`;
      await navigator.clipboard.writeText(url);
      toast.success("Board link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = () => {
    toast.info("Board menu functionality coming soon!");
  };

  return (
    <div className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Board name */}
        <div className="flex items-center">
          <h1 className="text-sm font-medium text-foreground truncate max-w-md">
            {boardName}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
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

          {/* Three Dots Menu */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleMenuClick}
          >
            <Menu className="w-4 h-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
