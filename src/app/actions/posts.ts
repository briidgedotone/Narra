"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";
import { db } from "@/lib/database";
import type { Database } from "@/types/database";

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

// Normalize Instagram platform post ID to shortcode format
function normalizeInstagramId(platformPostId: string, embedUrl: string): string {
  // If it's already a shortcode format (no underscores, reasonable length), use it
  if (!/\d+_\d+/.test(platformPostId) && platformPostId.length < 20) {
    return platformPostId;
  }
  
  // Try to extract shortcode from URL
  const shortcodeMatch = embedUrl.match(/\/p\/([A-Za-z0-9_-]+)/);
  if (shortcodeMatch) {
    return shortcodeMatch[1];
  }
  
  // If all else fails, use the original ID
  return platformPostId;
}

export async function savePostToBoard(postData: SavePostData, boardId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Normalize platform post ID for Instagram to ensure consistency
    const normalizedPlatformPostId = postData.platform === "instagram" 
      ? normalizeInstagramId(postData.platformPostId, postData.embedUrl)
      : postData.platformPostId;
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

    // Check if post already exists using normalized ID
    let post = await db.getPostByPlatformId(
      normalizedPlatformPostId,
      postData.platform
    );

    if (!post) {
      // Create post immediately without slow operations
      const postCreateData: Database["public"]["Tables"]["posts"]["Insert"] = {
        profile_id: profile.id,
        platform: postData.platform,
        platform_post_id: normalizedPlatformPostId,
        embed_url: postData.embedUrl,
        caption: postData.caption || "",
        ...(postData.transcript ? { transcript: postData.transcript } : {}),
        ...(postData.originalUrl ? { original_url: postData.originalUrl } : {}),
        metrics: postData.metrics || {},
        date_posted: postData.datePosted,
        // Instagram-specific fields
        ...(postData.thumbnail ? { thumbnail: postData.thumbnail } : {}),
        ...(postData.isVideo !== undefined
          ? { is_video: postData.isVideo }
          : {}),
        ...(postData.isCarousel !== undefined
          ? { is_carousel: postData.isCarousel }
          : {}),
        ...(postData.carouselMedia
          ? {
              carousel_media: postData.carouselMedia.map(item => ({
                id: item.id,
                type: item.type,
                url: item.url,
                thumbnail: item.thumbnail,
                is_video: item.isVideo,
              })),
            }
          : {}),
        ...(postData.carouselCount !== undefined
          ? { carousel_count: postData.carouselCount }
          : {}),
        ...(postData.videoUrl ? { video_url: postData.videoUrl } : {}),
        ...(postData.displayUrl ? { display_url: postData.displayUrl } : {}),
        ...(postData.shortcode ? { shortcode: postData.shortcode } : {}),
        ...(postData.dimensions ? { dimensions: postData.dimensions } : {}),
      };

      post = await db.createPost(postCreateData);

      // Update post with embed/transcript in background (don't await)
      Promise.resolve().then(async () => {
        try {
          const updates: Partial<
            Database["public"]["Tables"]["posts"]["Update"]
          > = {};

          // Fetch embed HTML for Instagram posts
          if (postData.platform === "instagram" && postData.originalUrl) {
            try {
              const embedResult = await fetchInstagramEmbed(
                postData.originalUrl
              );
              if (embedResult.success && embedResult.data?.html) {
                updates.embed_html = embedResult.data.html;
              }
            } catch (error) {
              console.error("Failed to fetch Instagram embed:", error);
            }
          }

          // Fetch transcript for TikTok posts
          if (postData.platform === "tiktok" && postData.originalUrl) {
            try {
              const transcriptResult =
                await scrapeCreatorsApi.tiktok.getVideoTranscript(
                  postData.originalUrl
                );
              if (
                transcriptResult.success &&
                (transcriptResult.data as { transcript?: string })?.transcript
              ) {
                const rawTranscript = (
                  transcriptResult.data as { transcript: string }
                ).transcript;
                updates.transcript = webvttToPlainText(rawTranscript);
              }
            } catch (error) {
              console.error("Failed to fetch transcript:", error);
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
                const data = transcriptResult.data as {
                  transcripts?: Array<{ text: string }>;
                };
                if (
                  data.transcripts &&
                  data.transcripts.length > 0 &&
                  data.transcripts[0]
                ) {
                  updates.transcript = data.transcripts[0].text;
                }
              }
            } catch (error) {
              console.error("Failed to fetch Instagram transcript:", error);
            }
          }

          // Update post with fetched data if any
          if (Object.keys(updates).length > 0) {
            await db.updatePost(post.id, updates);
          }
        } catch (error) {
          console.error("Failed to update post with embed/transcript:", error);
        }
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

export async function removePostFromAllUserBoards(postId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get all boards that contain this post for this user
    const userFolders = await db.getFoldersByUser(userId);
    const userBoardIds = userFolders?.flatMap(f => f.boards?.map((b: { id: string }) => b.id) || []) || [];
    
    if (userBoardIds.length === 0) {
      return { success: true, message: "No boards found" };
    }

    // Get all board-post relationships for this post in user's boards
    const boardsWithPost: any[] = [];
    for (const boardId of userBoardIds) {
      try {
        const postsInBoard = await db.getPostsInBoard(boardId);
        if (postsInBoard?.some((p: any) => p.id === postId)) {
          boardsWithPost.push(boardId);
        }
      } catch (error) {
        // Skip this board if there's an error
        continue;
      }
    }

    if (boardsWithPost.length === 0) {
      return { success: true, message: "Post not found in any boards" };
    }

    // Remove post from all boards where it exists
    for (const boardId of boardsWithPost) {
      await db.removePostFromBoard(boardId, postId);
    }

    revalidatePath("/dashboard");
    revalidatePath("/boards");
    revalidatePath("/saved");

    return { 
      success: true, 
      message: `Post removed from ${boardsWithPost.length} board${boardsWithPost.length !== 1 ? 's' : ''}` 
    };
  } catch (error) {
    console.error("Failed to remove post from boards:", error);
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
    const allPosts: Array<
      NonNullable<Awaited<ReturnType<typeof db.getPostsInBoard>>[number]>
    > = [];
    for (const boardId of boardIds) {
      const posts = await db.getPostsInBoard(boardId, 999, 0); // Get all posts
      if (posts) {
        const validPosts = posts.filter(
          (post): post is NonNullable<typeof post> =>
            post != null && post.profile != null
        );
        allPosts.push(...validPosts);
      }
    }

    // Remove duplicates and sort by date
    const uniquePosts = allPosts.filter(
      (post, index, self) =>
        index ===
        self.findIndex(
          p => (p as { id: string }).id === (post as { id: string }).id
        )
    );

    // Sort by date_posted descending and apply pagination
    const sortedPosts = uniquePosts
      .sort(
        (a, b) =>
          new Date((b as { datePosted: string }).datePosted).getTime() -
          new Date((a as { datePosted: string }).datePosted).getTime()
      )
      .slice(offset, offset + limit)
      .map(post => ({
        id: post.id as string,
        embedUrl: post.embedUrl as string,
        ...(post.originalUrl && { originalUrl: post.originalUrl as string }),
        caption: post.caption as string,
        ...(post.transcript && { transcript: post.transcript as string }),
        ...(post.isVideo !== undefined && { isVideo: post.isVideo as boolean }),
        ...(post.isCarousel !== undefined && {
          isCarousel: post.isCarousel as boolean,
        }),
        ...(post.carouselMedia && { carouselMedia: post.carouselMedia }),
        ...(post.carouselCount !== undefined && {
          carouselCount: post.carouselCount as number,
        }),
        ...(post.platformPostId && {
          platformPostId: post.platformPostId as string,
        }),
        ...(post.thumbnail && { thumbnail: post.thumbnail as string }),
        ...(post.shortcode && { shortcode: post.shortcode as string }),
        metrics: post.metrics as {
          views?: number;
          likes: number;
          comments: number;
          shares?: number;
        },
        datePosted: post.datePosted as string,
        platform: post.platform as "instagram" | "tiktok",
        profile: {
          handle: (post.profile as { handle: string }).handle,
          displayName: (post.profile as { displayName: string }).displayName,
          avatarUrl: (post.profile as { avatarUrl: string }).avatarUrl,
          verified: (post.profile as { verified: boolean }).verified,
        },
      }));

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

export async function checkPostInUserBoards(
  platformPostId: string,
  platform: "tiktok" | "instagram"
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // For Instagram, check both possible ID formats due to historical inconsistency
    let boardsWithPost: any[] = [];
    
    if (platform === "instagram") {
      // First try with the provided ID
      boardsWithPost = await db.getBoardsContainingPlatformPost(
        platformPostId,
        platform,
        userId
      );
      
      // If not found, we need to check for alternate ID formats
      // Instagram posts can be stored with either shortcode or numeric_userid format
      if (boardsWithPost.length === 0) {
        // For numeric IDs, also check if there's a post with matching shortcode
        // This handles the case where Following has numeric ID but post was saved with shortcode
        const normalizedId = normalizeInstagramId(platformPostId, "");
        if (normalizedId !== platformPostId) {
          try {
            const alternativeResult = await db.getBoardsContainingPlatformPost(
              normalizedId,
              platform,
              userId!
            );
            boardsWithPost = alternativeResult;
          } catch {
            // Ignore errors from alternative check
          }
        }
      }
    } else {
      boardsWithPost = await db.getBoardsContainingPlatformPost(
        platformPostId,
        platform,
        userId
      );
    }
    
    return { success: true, data: boardsWithPost };
  } catch (error) {
    console.error("Failed to check post in boards:", error);
    return { success: false, error: "Failed to check post status" };
  }
}
