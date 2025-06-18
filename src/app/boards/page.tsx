"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";

import { DashboardLayout } from "@/components/layout";
import { BoardCard } from "@/components/shared/board-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PlusCircle,
  FolderClosed,
  Clipboard,
  ChevronRight,
  ChevronDown,
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";
import { useFolders } from "@/hooks/useFolders";

export default function BoardsPage() {
  const { userId } = useAuth();
  const { folders, loading, createNewBoard, createNewFolder } = useFolders();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      redirect("/sign-in");
    }
  }, [userId]);

  if (!userId) {
    redirect("/sign-in");
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateBoard = async () => {
    if (selectedFolder) {
      await createNewBoard(selectedFolder);
    } else if (folders.length > 0) {
      // Use first folder if none selected
      await createNewBoard(folders[0].id);
    } else {
      // Create a folder first
      const newFolder = await createNewFolder();
      if (newFolder) {
        await createNewBoard(newFolder.id);
      }
    }
  };

  const handleCreateFolder = async () => {
    await createNewFolder();
  };

  // Get all boards across all folders for the main view
  const allBoards = folders.flatMap(
    folder =>
      folder.boards?.map(board => ({
        ...board,
        folderName: folder.name,
        folderId: folder.id,
      })) || []
  );

  // Get boards for selected folder
  const selectedFolderBoards = selectedFolder
    ? folders.find(f => f.id === selectedFolder)?.boards || []
    : allBoards;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My Boards</h1>
            <p className="text-muted-foreground">
              Organize your saved content into boards
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCreateFolder}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
            <Button onClick={handleCreateBoard}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </div>
        </div>

        {folders.length === 0 ? (
          <EmptyState
            icons={[Clipboard, FolderClosed]}
            title="No folders or boards yet"
            description="Create your first folder to start organizing your saved content into boards."
            action={{
              label: "Create Folder",
              onClick: handleCreateFolder,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Folder Navigation */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-medium mb-3">Folders</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedFolder === null
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    All Boards ({allBoards.length})
                  </button>

                  {folders.map(folder => (
                    <div key={folder.id}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFolder(folder.id)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {expandedFolders.has(folder.id) ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedFolder(folder.id)}
                          className={`flex-1 text-left px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                            selectedFolder === folder.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {folder.name} ({folder.boards?.length || 0})
                        </button>
                      </div>

                      {expandedFolders.has(folder.id) && folder.boards && (
                        <div className="ml-4 mt-1 space-y-1">
                          {folder.boards.map(board => (
                            <Link
                              key={board.id}
                              href={`/boards/${board.id}`}
                              className="block px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                            >
                              {board.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content - Boards Grid */}
            <div className="lg:col-span-3">
              {selectedFolderBoards.length === 0 ? (
                <EmptyState
                  icons={[Clipboard]}
                  title={
                    selectedFolder
                      ? "No boards in this folder"
                      : "No boards yet"
                  }
                  description={
                    selectedFolder
                      ? "Create your first board in this folder to start organizing your content."
                      : "Create your first board to start saving and organizing content."
                  }
                  action={{
                    label: "Create Board",
                    onClick: handleCreateBoard,
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {selectedFolderBoards.map(board => (
                    <BoardCard
                      key={board.id}
                      board={{
                        id: board.id,
                        name: board.name,
                        description: board.description,
                        postCount: 0, // TODO: Get actual post count
                        lastUpdated: board.updated_at,
                        isShared: board.is_shared,
                        publicId: board.public_id,
                        folderName:
                          "folderName" in board ? board.folderName : undefined,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
