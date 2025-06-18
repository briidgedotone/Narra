import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getUserFoldersWithBoards, createBoard, createFolder } from "@/app/actions/folders";

interface Folder {
  id: string;
  name: string;
  boards: Array<{
    id: string;
    name: string;
  }>;
}

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFolders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUserFoldersWithBoards();
      if (result.success && result.data) {
        setFolders(result.data);
      } else {
        setError(result.error || "Failed to load folders");
      }
    } catch (err) {
      console.error("Failed to load folders:", err);
      setError("Failed to load folders");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewBoard = async (folderId: string, baseName: string = "Untitled Board") => {
    try {
      // Generate a unique board name by checking existing names in the folder
      const folder = folders.find(f => f.id === folderId);
      const existingBoardNames = folder?.boards?.map(b => b.name) || [];
      
      let boardName = baseName;
      let counter = 1;
      
      while (existingBoardNames.includes(boardName)) {
        boardName = `${baseName} ${counter}`;
        counter++;
      }

      const result = await createBoard({
        name: boardName,
        folder_id: folderId,
        description: "",
        is_shared: false,
      });

      if (result.success && result.data) {
        // Refresh folders to get updated data
        await loadFolders();
        toast.success("Board created successfully!");
        return result.data;
      } else {
        toast.error(result.error || "Failed to create board");
        return null;
      }
    } catch (error) {
      console.error("Failed to create board:", error);
      toast.error("Failed to create board");
      return null;
    }
  };

  const createNewFolder = async (baseName: string = "New Folder") => {
    try {
      // Generate a unique folder name by checking existing names
      let folderName = baseName;
      let counter = 1;
      
      while (folders.some(folder => folder.name === folderName)) {
        folderName = `${baseName} ${counter}`;
        counter++;
      }

      const result = await createFolder({
        name: folderName,
        description: "",
      });

      if (result.success && result.data) {
        // Refresh folders to get updated data
        await loadFolders();
        toast.success("Folder created successfully!");
        return result.data;
      } else {
        toast.error(result.error || "Failed to create folder");
        return null;
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
      return null;
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  return {
    folders,
    isLoading,
    error,
    loadFolders,
    createNewBoard,
    createNewFolder,
  };
} 