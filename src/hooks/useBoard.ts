import { redirect } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  getBoardById,
  getPublicBoard,
  updateBoard,
} from "@/app/actions/folders";
import {
  getPostsInBoard,
  getPublicBoardPosts,
  removePostFromBoard,
} from "@/app/actions/posts";
import type { BoardData, SavedPost } from "@/types/board";

export function useBoard(boardId: string, isSharedView = false) {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadBoardData = useCallback(async () => {
    setIsLoadingBoard(true);
    try {
      const result = isSharedView
        ? await getPublicBoard(boardId)
        : await getBoardById(boardId);
      if (result.success && result.data) {
        setBoard(result.data);
      } else {
        toast.error("Board not found");
        redirect("/");
      }
    } catch (error) {
      console.error("Failed to load board:", error);
      toast.error("Failed to load board");
    } finally {
      setIsLoadingBoard(false);
    }
  }, [boardId, isSharedView]);

  const loadBoardPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const result = isSharedView
        ? await getPublicBoardPosts(boardId)
        : await getPostsInBoard(boardId, 50, 0);
      if (result.success && result.data) {
        setPosts(result.data as unknown as SavedPost[]);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Failed to load board posts:", error);
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [boardId, isSharedView]);

  const updateBoardInDatabase = useCallback(
    async (updates: { name?: string; description?: string }) => {
      if (!board || isUpdating) return;

      setIsUpdating(true);
      try {
        const result = await updateBoard(board.id, updates);
        if (result.success) {
          // Board updated successfully - the sidebar will update via revalidation
        } else {
          toast.error("Failed to update board");
        }
      } catch (error) {
        console.error("Failed to update board:", error);
        toast.error("Failed to update board");
      } finally {
        setIsUpdating(false);
      }
    },
    [board, isUpdating]
  );

  const handleNameChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!board) return;

      const newName = e.target.value;
      setBoard({ ...board, name: newName });

      // Debounced update to database
      clearTimeout(window.boardNameTimeout);
      window.boardNameTimeout = setTimeout(async () => {
        await updateBoardInDatabase({ name: newName });
      }, 1000);
    },
    [board, updateBoardInDatabase]
  );

  const handleDescriptionChange = useCallback(
    async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!board) return;

      const newDescription = e.target.value;
      setBoard({ ...board, description: newDescription });

      // Auto-resize textarea
      e.target.style.height = "auto";
      e.target.style.height = e.target.scrollHeight + "px";

      // Debounced update to database
      clearTimeout(window.boardDescTimeout);
      window.boardDescTimeout = setTimeout(async () => {
        await updateBoardInDatabase({ description: newDescription });
      }, 1000);
    },
    [board, updateBoardInDatabase]
  );

  const handleRemovePost = useCallback(
    async (postId: string) => {
      try {
        const result = await removePostFromBoard(postId, boardId);
        if (result.success) {
          setPosts(prev => prev.filter(post => post.id !== postId));
          toast.success("Post removed from board");
        } else {
          toast.error("Failed to remove post");
        }
      } catch (error) {
        console.error("Failed to remove post:", error);
        toast.error("Failed to remove post");
      }
    },
    [boardId]
  );

  // Auto-resize textarea when description changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [board?.description]);

  useEffect(() => {
    loadBoardData();
    loadBoardPosts();
  }, [loadBoardData, loadBoardPosts]);

  return {
    board,
    posts,
    isLoadingBoard,
    isLoadingPosts,
    isUpdating,
    textareaRef,
    handleNameChange,
    handleDescriptionChange,
    handleRemovePost,
    refreshBoard: loadBoardData,
    refreshPosts: loadBoardPosts,
  };
}
