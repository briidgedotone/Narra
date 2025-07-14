"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { toast } from "sonner";

import {
  getUserFoldersWithBoards,
  createBoard,
  createFolder,
} from "@/app/actions/folders";

interface Folder {
  id: string;
  name: string;
  boards: Array<{
    id: string;
    name: string;
  }>;
}

interface FoldersContextValue {
  folders: Folder[];
  isLoading: boolean;
  error: string | null;
  loadFolders: () => Promise<void>;
  createNewBoard: (folderId: string, baseName?: string) => Promise<any>;
  createNewFolder: (baseName?: string) => Promise<any>;
  refreshFolders: () => Promise<void>;
}

const FoldersContext = createContext<FoldersContextValue | undefined>(
  undefined
);

interface FoldersProviderProps {
  children: ReactNode;
}

export function FoldersProvider({ children }: FoldersProviderProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid dependency issues in useCallback
  const lastFetchTimeRef = useRef<number>(0);
  const foldersRef = useRef<Folder[]>([]);

  // Cache duration: 30 seconds to prevent excessive API calls
  const CACHE_DURATION = 30 * 1000;

  // Keep refs in sync with state
  useEffect(() => {
    foldersRef.current = folders;
  }, [folders]);

  const loadFolders = useCallback(async (forceRefresh: boolean = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;

    // Skip if data is fresh and not forcing refresh
    if (
      !forceRefresh &&
      foldersRef.current.length > 0 &&
      timeSinceLastFetch < CACHE_DURATION
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getUserFoldersWithBoards();
      if (result.success && result.data) {
        setFolders(result.data);
        lastFetchTimeRef.current = now;
      } else {
        setError(result.error || "Failed to load folders");
      }
    } catch (err) {
      console.error("Failed to load folders:", err);
      setError("Failed to load folders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFolders = useCallback(async () => {
    await loadFolders(true);
  }, [loadFolders]);

  const createNewBoard = useCallback(
    async (folderId: string, baseName: string = "Untitled Board") => {
      try {
        // Generate a unique board name by checking existing names in the folder
        const folder = foldersRef.current.find(f => f.id === folderId);
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
          await refreshFolders();
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
    },
    [refreshFolders]
  );

  const createNewFolder = useCallback(
    async (baseName: string = "New Folder") => {
      try {
        // Generate a unique folder name by checking existing names
        let folderName = baseName;
        let counter = 1;

        while (foldersRef.current.some(folder => folder.name === folderName)) {
          folderName = `${baseName} ${counter}`;
          counter++;
        }

        const result = await createFolder({
          name: folderName,
          description: "",
          user_id: "", // This will be handled by the server action
        });

        if (result.success && result.data) {
          // Refresh folders to get updated data
          await refreshFolders();
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
    },
    [refreshFolders]
  );

  // Initial load
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const value = useMemo<FoldersContextValue>(
    () => ({
      folders,
      isLoading,
      error,
      loadFolders,
      createNewBoard,
      createNewFolder,
      refreshFolders,
    }),
    [
      folders,
      isLoading,
      error,
      loadFolders,
      createNewBoard,
      createNewFolder,
      refreshFolders,
    ]
  );

  return (
    <FoldersContext.Provider value={value}>{children}</FoldersContext.Provider>
  );
}

export function useFolders() {
  const context = useContext(FoldersContext);
  if (context === undefined) {
    throw new Error("useFolders must be used within a FoldersProvider");
  }
  return context;
}
