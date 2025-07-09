"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { DatabaseService } from "@/lib/database";
import type { Post } from "@/types/database";

const db = new DatabaseService();

interface SavePostData {
  handle: string;
  platform: "instagram" | "tiktok";
  displayName?: string;
  bio?: string;
  followers?: number;
  avatarUrl?: string;
  verified?: boolean;
  platformPostId: string;
  embedUrl: string;
  caption?: string;
  originalUrl?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  datePosted: string;
  // Instagram-specific fields
  thumbnail?: string;
  isVideo?: boolean;
  isCarousel?: boolean;
  carouselMedia?: Array<{
    id: string;
    type: "image" | "video";
    url: string;
    thumbnail: string;
    isVideo: boolean;
  }>;
  carouselCount?: number;
  videoUrl?: string;
  displayUrl?: string;
  shortcode?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export async function savePostToBoard(postData: SavePostData, boardId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // First, ensure the profile exists
    let profile = await db.getProfileByHandle(
      postData.handle,
      postData.platform
    );

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await db.createProfile({
        handle: postData.handle,
        platform: postData.platform,
        display_name: postData.displayName || postData.handle,
        bio: postData.bio || "",
        followers_count: postData.followers || 0,
        avatar_url: postData.avatarUrl || "",
        verified: postData.verified || false,
      });
    }

    // Check if post already exists
    let post = await db.getPostByPlatformId(
      postData.platformPostId,
      postData.platform
    );

    if (!post) {
      // Create post if it doesn't exist
      post = await db.createPost({
        profile_id: profile.id,
        platform: postData.platform,
        platform_post_id: postData.platformPostId,
        embed_url: postData.embedUrl,
        caption: postData.caption || "",
        original_url: postData.originalUrl || null,
        metrics: postData.metrics || {},
        date_posted: postData.datePosted,
        // Instagram-specific fields
        thumbnail: postData.thumbnail || null,
        is_video: postData.isVideo || false,
        is_carousel: postData.isCarousel || false,
        carousel_media:
          postData.carouselMedia?.map(item => ({
            id: item.id,
            type: item.type,
            url: item.url,
            thumbnail: item.thumbnail,
            is_video: item.isVideo,
          })) || null,
        carousel_count: postData.carouselCount || 0,
        video_url: postData.videoUrl || null,
        display_url: postData.displayUrl || null,
        shortcode: postData.shortcode || null,
        dimensions: postData.dimensions || null,
      });
    }

    // Add post to board (this will handle duplicates via unique constraint)
    await db.addPostToBoard(boardId, post.id);

    revalidatePath("/dashboard");
    revalidatePath("/boards");
    revalidatePath(`/boards/${boardId}`);
    revalidatePath("/saved");

    return { success: true, data: { post, boardId } };
  } catch (error) {
    console.error("Failed to save post to board:", error);
    // Handle duplicate post in board gracefully
    if (error instanceof Error && error.message?.includes("duplicate")) {
      return { success: false, error: "Post already saved to this board" };
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return { success: false, error: "Post already saved to this board" };
    }
    return { success: false, error: "Failed to save post" };
  }
}

export async function removePostFromBoard(postId: string, boardId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await db.removePostFromBoard(boardId, postId);

    revalidatePath("/dashboard");
    revalidatePath("/boards");
    revalidatePath(`/boards/${boardId}`);
    revalidatePath("/saved");

    return { success: true };
  } catch (error) {
    console.error("Failed to remove post from board:", error);
    return { success: false, error: "Failed to remove post" };
  }
}

export async function getPostsInBoard(boardId: string, limit = 20, offset = 0) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const posts = await db.getPostsInBoard(boardId, limit, offset);
    return { success: true, data: posts };
  } catch (error) {
    console.error("Failed to get posts in board:", error);
    return { success: false, error: "Failed to load posts" };
  }
}

export async function getAllUserSavedPosts(limit = 50, offset = 0) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get all user's folders with boards
    const folders = await db.getFoldersByUser(userId);
    const boardIds =
      folders?.flatMap(f => f.boards?.map((b: { id: string }) => b.id) || []) ||
      [];

    if (boardIds.length === 0) {
      return { success: true, data: [] };
    }

    // Get all posts from user's boards
    const allPosts: Post[] = [];
    for (const boardId of boardIds) {
      const posts = await db.getPostsInBoard(boardId, 999, 0); // Get all posts
      allPosts.push(...(posts || []));
    }

    // Remove duplicates and sort by date
    const uniquePosts = allPosts.filter(
      (post: Post, index: number, self: Post[]) =>
        index === self.findIndex((p: Post) => p.id === post.id)
    );

    // Sort by date_posted descending and apply pagination
    const sortedPosts = uniquePosts
      .sort(
        (a: Post, b: Post) =>
          new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime()
      )
      .slice(offset, offset + limit);

    return { success: true, data: sortedPosts };
  } catch (error) {
    console.error("Failed to get user saved posts:", error);
    return { success: false, error: "Failed to load saved posts" };
  }
}

export async function getPublicBoardPosts(publicId: string) {
  try {
    const board = await db.getBoardByPublicId(publicId);
    if (!board || !board.is_shared) {
      return { success: false, error: "Board not found" };
    }
    // The posts are already included in the board data from getBoardByPublicId
    return { success: true, data: board.posts || [] };
  } catch (error) {
    console.error("Failed to get posts in board:", error);
    return { success: false, error: "Failed to load posts" };
  }
}
