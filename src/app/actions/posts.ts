"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";
import { DatabaseService } from "@/lib/database";

// Helper function to convert WebVTT transcript to plain text
function webvttToPlainText(webvttText: string): string {
  // Remove WEBVTT header
  const text = webvttText.replace(/^WEBVTT\s*\n/, "");

  // Split by double newlines to get cue blocks
  const cueBlocks = text.split(/\n\s*\n/);

  const textLines: string[] = [];

  for (const block of cueBlocks) {
    const lines = block.trim().split("\n");

    // Skip empty blocks
    if (lines.length === 0) continue;

    // Find lines that don't contain timestamps (format: HH:MM:SS.mmm --> HH:MM:SS.mmm)
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip timestamp lines and empty lines
      if (
        trimmedLine === "" ||
        /^\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}$/.test(
          trimmedLine
        )
      ) {
        continue;
      }

      // This is actual transcript text
      textLines.push(trimmedLine);
    }
  }

  // Join all text lines with spaces and clean up
  return textLines.join(" ").replace(/\s+/g, " ").trim();
}

// Helper function to fetch Instagram embed on server
async function fetchInstagramEmbed(url: string) {
  try {
    const apiUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/instagram-embed`
      : "http://localhost:3000/api/instagram-embed";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Instagram embed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

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
  transcript?: string;
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
      // Fetch embed HTML for Instagram posts
      let embedHtml: string | null = null;
      if (postData.platform === "instagram" && postData.originalUrl) {
        try {
          const embedResult = await fetchInstagramEmbed(postData.originalUrl);
          if (embedResult.success && embedResult.data?.html) {
            embedHtml = embedResult.data.html;
          }
        } catch (error) {
          console.error("Failed to fetch Instagram embed:", error);
          // Continue without embed HTML - the post will still be saved
        }
      }

      // Fetch transcript for TikTok posts
      let transcript: string | null = null;
      if (postData.platform === "tiktok" && postData.originalUrl) {
        try {
          const transcriptResult =
            await scrapeCreatorsApi.tiktok.getVideoTranscript(
              postData.originalUrl
            );
          if (
            transcriptResult.success &&
            (transcriptResult.data as any)?.transcript
          ) {
            const rawTranscript = (transcriptResult.data as any).transcript;
            // Convert WebVTT format to plain text
            transcript = webvttToPlainText(rawTranscript);
          }
        } catch (error) {
          console.error("Failed to fetch transcript:", error);
          // Continue without transcript - the post will still be saved
        }
      }

      // Fetch transcript for Instagram video posts
      if (
        postData.platform === "instagram" &&
        postData.isVideo &&
        postData.originalUrl
      ) {
        try {
          const transcriptResult =
            await scrapeCreatorsApi.instagram.getVideoTranscript(
              postData.originalUrl
            );
          if (transcriptResult.success && transcriptResult.data) {
            // Check if response has transcripts array (based on your example)
            const data = transcriptResult.data as any;
            if (data.transcripts && data.transcripts.length > 0) {
              transcript = data.transcripts[0].text;
            }
          }
        } catch (error) {
          console.error("Failed to fetch Instagram transcript:", error);
          // Continue without transcript - the post will still be saved
        }
      }

      // Create post if it doesn't exist
      const finalTranscript = transcript || postData.transcript;
      post = await db.createPost({
        profile_id: profile.id,
        platform: postData.platform,
        platform_post_id: postData.platformPostId,
        embed_url: postData.embedUrl,
        caption: postData.caption || "",
        ...(finalTranscript && { transcript: finalTranscript }),
        ...(postData.originalUrl && { original_url: postData.originalUrl }),
        metrics: postData.metrics || {},
        date_posted: postData.datePosted,
        // Instagram-specific fields
        ...(postData.thumbnail && { thumbnail: postData.thumbnail }),
        is_video: postData.isVideo || false,
        is_carousel: postData.isCarousel || false,
        ...(postData.carouselMedia && {
          carousel_media: postData.carouselMedia.map(item => ({
            id: item.id,
            type: item.type,
            url: item.url,
            thumbnail: item.thumbnail,
            is_video: item.isVideo,
          })),
        }),
        carousel_count: postData.carouselCount || 0,
        ...(postData.videoUrl && { video_url: postData.videoUrl }),
        ...(postData.displayUrl && { display_url: postData.displayUrl }),
        ...(postData.shortcode && { shortcode: postData.shortcode }),
        ...(postData.dimensions && { dimensions: postData.dimensions }),
        ...(embedHtml && { embed_html: embedHtml }),
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
    const allPosts: any[] = [];
    for (const boardId of boardIds) {
      const posts = await db.getPostsInBoard(boardId, 999, 0); // Get all posts
      allPosts.push(...(posts?.filter(Boolean) || []));
    }

    // Remove duplicates and sort by date
    const uniquePosts = allPosts.filter(
      (post: any, index: number, self: any[]) =>
        index === self.findIndex((p: any) => p.id === post.id)
    );

    // Sort by date_posted descending and apply pagination
    const sortedPosts = uniquePosts
      .sort(
        (a: any, b: any) =>
          new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
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
