"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { DatabaseService } from "@/lib/database";
import type { Database } from "@/types/database";

const db = new DatabaseService();

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
    const board = await db.updateBoard(boardId, updates);
    
    revalidatePath("/dashboard");
    revalidatePath("/boards");
    revalidatePath(`/boards/${boardId}`);
    
    return { success: true, data: board };
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