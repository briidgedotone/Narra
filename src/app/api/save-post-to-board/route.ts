import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/database";
import { createAdminClient } from "@/lib/supabase";
import type { Database } from "@/types/database";

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
  if (shortcodeMatch && shortcodeMatch[1]) {
    return shortcodeMatch[1];
  }
  
  // If all else fails, use the original ID
  return platformPostId;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postData, boardId }: { postData: SavePostData; boardId: string } = body;

    if (!postData || !boardId) {
      return NextResponse.json(
        { success: false, error: "Missing postData or boardId" },
        { status: 400 }
      );
    }

    // Normalize platform post ID for Instagram to ensure consistency
    const normalizedPlatformPostId = postData.platform === "instagram" 
      ? normalizeInstagramId(postData.platformPostId, postData.embedUrl)
      : postData.platformPostId;

    // Upsert profile (create or update if exists)
    const profile = await db.upsertProfile({
      handle: postData.handle,
      platform: postData.platform,
      display_name: postData.displayName || postData.handle,
      bio: postData.bio || "",
      followers_count: postData.followers || 0,
      avatar_url: postData.avatarUrl || "",
      verified: postData.verified || false,
    });

    // Upsert post (create or update if exists using normalized ID)
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

    const post = await db.upsertPost(postCreateData);

    // Check if post is already in the board
    const adminClient = createAdminClient();
    try {
      const { data: existingBoardPost } = await adminClient
        .from("board_posts")
        .select("id")
        .eq("board_id", boardId)
        .eq("post_id", post.id)
        .single();
      
      if (existingBoardPost) {
        return NextResponse.json({
          success: false,
          error: "Post already exists in this board",
        });
      }
    } catch (error) {
      // No existing post found, which is what we want
    }

    // Add post to board
    await db.addPostToBoard(boardId, post.id);

    // TODO: Trigger background processes for embeds and transcripts
    // This would normally be done through queue processing

    return NextResponse.json({
      success: true,
      data: {
        post: {
          id: post.id,
          platformPostId: normalizedPlatformPostId,
          platform: post.platform,
        },
        profile: {
          id: profile.id,
          handle: profile.handle,
        },
      },
    });

  } catch (error) {
    console.error("Save post to board error:", error);
    
    // Handle specific error types
    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({
        success: false,
        error: "Post already exists in this board",
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}