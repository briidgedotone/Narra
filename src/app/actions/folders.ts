"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/server";
import { db } from "@/lib/database";
import type { Database } from "@/types/database";

export async function getUserFoldersWithBoards() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const folders = await db.getFoldersByUser(userId);
    return { success: true, data: folders };
  } catch (error) {
    console.error("Failed to get user folders:", error);
    return { success: false, error: "Failed to load folders" };
  }
}

export async function createFolder(
  folderData: Database["public"]["Tables"]["folders"]["Insert"]
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const folder = await db.createFolder({
      ...folderData,
      user_id: userId,
    });

    revalidatePath("/dashboard");
    revalidatePath("/boards");

    return { success: true, data: folder };
  } catch (error) {
    console.error("Failed to create folder:", error);
    return { success: false, error: "Failed to create folder" };
  }
}

export async function updateFolder(
  folderId: string,
  updates: Database["public"]["Tables"]["folders"]["Update"]
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const folder = await db.updateFolder(folderId, updates);

    revalidatePath("/dashboard");
    revalidatePath("/boards");

    return { success: true, data: folder };
  } catch (error) {
    console.error("Failed to update folder:", error);
    return { success: false, error: "Failed to update folder" };
  }
}

export async function deleteFolder(folderId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await db.deleteFolder(folderId);

    revalidatePath("/dashboard");
    revalidatePath("/boards");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete folder:", error);
    return { success: false, error: "Failed to delete folder" };
  }
}

export async function createBoard(
  boardData: Database["public"]["Tables"]["boards"]["Insert"]
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const board = await db.createBoard(boardData);

    revalidatePath("/dashboard");
    revalidatePath("/boards");
    revalidatePath(`/boards/${board.id}`);

    return { success: true, data: board };
  } catch (error) {
    console.error("Failed to create board:", error);
    return { success: false, error: "Failed to create board" };
  }
}

export async function updateBoard(
  boardId: string,
  updates: Database["public"]["Tables"]["boards"]["Update"]
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await db.updateBoard(boardId, updates);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update board:", error);
    return { success: false, error: "Failed to update board" };
  }
}

export async function deleteBoard(boardId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await db.deleteBoard(boardId);

    revalidatePath("/dashboard");
    revalidatePath("/boards");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete board:", error);
    return { success: false, error: "Failed to delete board" };
  }
}

export async function getBoardById(boardId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const board = await db.getBoardById(boardId);
    return { success: true, data: board };
  } catch (error) {
    console.error("Failed to get board:", error);
    return { success: false, error: "Board not found" };
  }
}

export async function enableBoardSharing(boardId: string) {
  try {
    const result = await db.enableBoardSharing(boardId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to enable board sharing:", error);
    return { success: false, error: "Failed to enable board sharing" };
  }
}

export async function getPublicBoard(publicId: string) {
  try {
    const board = await db.getBoardByPublicId(publicId);
    if (!board || !board.is_shared) {
      return { success: false, error: "Board not found" };
    }
    return {
      success: true,
      data: {
        ...board,
        // Remove posts from the board data since they'll be fetched separately
        board_posts: undefined,
      },
    };
  } catch (error) {
    console.error("Failed to get public board:", error);
    return { success: false, error: "Board not found" };
  }
}

export async function getAdminBoards() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error("Admin access required");
  }

  try {
    const boards = await db.getBoardsByUser(userId);
    return { success: true, data: boards };
  } catch (error) {
    console.error("Failed to get admin boards:", error);
    return { success: false, error: "Failed to load boards" };
  }
}

export async function getFeaturedBoards() {
  try {
    const featuredBoards = await db.getFeaturedBoards();
    return { success: true, data: featuredBoards };
  } catch (error) {
    console.error("Failed to get featured boards:", error);
    return { success: false, error: "Failed to load featured boards" };
  }
}

export async function isBoardFeatured(boardId: string) {
  try {
    const featuredBoards = await db.getFeaturedBoards();
    const isFeatured = featuredBoards?.some(featured => featured.board_id === boardId) || false;
    return { success: true, data: isFeatured };
  } catch (error) {
    console.error("Failed to check if board is featured:", error);
    return { success: false, error: "Failed to check featured status" };
  }
}

export async function setFeaturedBoard(
  boardId: string,
  displayOrder: number,
  coverImageUrl: string | null,
  title?: string,
  description?: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error("Admin access required");
  }

  try {
    // First, remove any existing featured board at this position
    await db.deleteFeaturedBoard(displayOrder);

    // Then insert the new featured board
    const featuredBoardData: {
      board_id: string;
      display_order: number;
      cover_image_url?: string;
      title?: string;
      description?: string;
    } = {
      board_id: boardId,
      display_order: displayOrder,
    };

    if (coverImageUrl) {
      featuredBoardData.cover_image_url = coverImageUrl;
    }
    if (title) {
      featuredBoardData.title = title;
    }
    if (description) {
      featuredBoardData.description = description;
    }

    const data = await db.createFeaturedBoard(featuredBoardData);

    return { success: true, data };
  } catch (error) {
    console.error("Failed to set featured board:", error);
    return { success: false, error: "Failed to set featured board" };
  }
}

export async function deleteFeaturedBoard(displayOrder: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error("Admin access required");
  }

  try {
    await db.deleteFeaturedBoard(displayOrder);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete featured board:", error);
    return { success: false, error: "Failed to delete featured board" };
  }
}
