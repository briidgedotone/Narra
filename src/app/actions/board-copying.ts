"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { DatabaseService } from "@/lib/database";

const db = new DatabaseService();

/**
 * Copy a shared board to user's account
 */
export async function copySharedBoardToUser(
  publicId: string,
  targetFolderId: string,
  customName?: string
) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // 1. Get the shared board and its posts
    const originalBoard = await db.getBoardByPublicId(publicId);

    if (!originalBoard) {
      return { success: false, error: "Shared board not found" };
    }

    // 2. Check if user already copied this board
    const existingCopy = await db.getBoardByUserAndCopiedFrom(userId, publicId);
    if (existingCopy) {
      return { success: false, error: "You have already copied this board" };
    }

    // 3. Create new board in user's folder
    const boardName = customName || `${originalBoard.name} (Copy)`;
    const newBoard = await db.createBoard({
      folder_id: targetFolderId,
      name: boardName,
      description: originalBoard.description,
      copied_from_public_id: publicId,
      copied_at: new Date().toISOString(),
      original_board_name: originalBoard.name,
      is_shared: false, // Copied boards start as private
    });

    // 4. Copy all posts to the new board
    if (originalBoard.posts && originalBoard.posts.length > 0) {
      for (const post of originalBoard.posts) {
        await db.addPostToBoard(newBoard.id, post.id);
      }
    }

    // 5. Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/boards");

    return { success: true, data: newBoard };
  } catch (error) {
    console.error("Failed to copy shared board:", error);
    return { success: false, error: "Failed to copy board" };
  }
}

/**
 * Get user's copied boards
 */
export async function getUserCopiedBoards() {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const copiedBoards = await db.getCopiedBoardsByUser(userId);
    return { success: true, data: copiedBoards };
  } catch (error) {
    console.error("Failed to get copied boards:", error);
    return { success: false, error: "Failed to load copied boards" };
  }
}

/**
 * Check if user has already copied a specific shared board
 */
export async function checkIfBoardAlreadyCopied(publicId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const existingCopy = await db.getBoardByUserAndCopiedFrom(userId, publicId);
    return { success: true, data: { alreadyCopied: !!existingCopy } };
  } catch (error) {
    console.error("Failed to check copied board:", error);
    return { success: false, error: "Failed to check board status" };
  }
}
