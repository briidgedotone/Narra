"use client";

import { Search, FolderPlus, BookOpen, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CreateFolderModal } from "./create-folder-modal";

interface QuickActionsProps {
  userId: string;
  onSuccess?: () => void;
}

export function QuickActions({ userId, onSuccess }: QuickActionsProps) {
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const handleComingSoon = (action: string) => {
    alert(`${action} feature coming soon!`);
  };

  const handleFolderCreated = () => {
    setCreateFolderOpen(false);
    onSuccess?.();
  };

  const handleCreateFolderClick = () => {
    console.log("Create folder clicked, setting open to true");
    setCreateFolderOpen(true);
  };

  // Debug log
  console.log("QuickActions render:", { createFolderOpen, userId });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="default"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleComingSoon("Discover Content")}
            >
              <Search className="h-6 w-6" />
              <span className="text-sm">Discover Content</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={handleCreateFolderClick}
            >
              <FolderPlus className="h-6 w-6" />
              <span className="text-sm">Create Folder</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleComingSoon("View Saved Posts")}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Saved Posts</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleComingSoon("View Following")}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Following</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateFolderModal
        userId={userId}
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSuccess={handleFolderCreated}
      />
    </>
  );
}
