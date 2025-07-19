import type { Database } from "@/types/database";

import { createAdminClient, supabase } from "./supabase";

// Generic database operations with singleton pattern
export class DatabaseService {
  private static instance: DatabaseService;
  private client = supabase;
  private adminClient = createAdminClient();

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Users
  async createUser(userData: Database["public"]["Tables"]["users"]["Insert"]) {
    const { data, error } = await this.adminClient
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserById(id: string) {
    const { data, error } = await this.adminClient
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(
    id: string,
    updates: Database["public"]["Tables"]["users"]["Update"]
  ) {
    const { data, error } = await this.adminClient
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async upsertUser(userData: Database["public"]["Tables"]["users"]["Insert"]) {
    const { data, error } = await this.adminClient
      .from("users")
      .upsert(userData, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Profiles
  async createProfile(
    profileData: Database["public"]["Tables"]["profiles"]["Insert"]
  ) {
    const { data, error } = await this.adminClient
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProfileByHandle(handle: string, platform: "tiktok" | "instagram") {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("handle", handle)
      .eq("platform", platform)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  }

  async getProfileById(id: string) {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(
    profileId: string,
    updates: Database["public"]["Tables"]["profiles"]["Update"]
  ) {
    const { data, error } = await this.client
      .from("profiles")
      .update(updates)
      .eq("id", profileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async upsertProfile(
    profileData: Database["public"]["Tables"]["profiles"]["Insert"]
  ) {
    const { data, error } = await this.adminClient
      .from("profiles")
      .upsert(profileData, { onConflict: "handle,platform" })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async searchProfiles(query: string, platform?: "tiktok" | "instagram") {
    let queryBuilder = this.client
      .from("profiles")
      .select("*")
      .or(`handle.ilike.%${query}%,display_name.ilike.%${query}%`);

    if (platform) {
      queryBuilder = queryBuilder.eq("platform", platform);
    }

    const { data, error } = await queryBuilder.order("followers_count", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  }

  // Posts
  async createPost(postData: Database["public"]["Tables"]["posts"]["Insert"]) {
    const { data, error } = await this.adminClient
      .from("posts")
      .insert(postData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async upsertPost(postData: Database["public"]["Tables"]["posts"]["Insert"]) {
    const { data, error } = await this.adminClient
      .from("posts")
      .upsert(postData, { onConflict: "platform_post_id,platform" })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPostsByProfile(profileId: string, limit = 20, offset = 0) {
    const { data, error } = await this.client
      .from("posts")
      .select("*, profiles(*)")
      .eq("profile_id", profileId)
      .order("date_posted", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async getLatestPosts(limit = 20, offset = 0) {
    const { data, error } = await this.client
      .from("posts")
      .select("*, profiles(*)")
      .order("date_posted", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async getPostByPlatformId(
    platformPostId: string,
    platform: "tiktok" | "instagram"
  ) {
    const { data, error } = await this.client
      .from("posts")
      .select("*, profiles(*)")
      .eq("platform_post_id", platformPostId)
      .eq("platform", platform)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  }

  async updatePost(
    postId: string,
    updates: Database["public"]["Tables"]["posts"]["Update"]
  ) {
    const { data, error } = await this.adminClient
      .from("posts")
      .update(updates)
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Folders
  async createFolder(
    folderData: Database["public"]["Tables"]["folders"]["Insert"]
  ) {
    const { data, error } = await this.adminClient
      .from("folders")
      .insert(folderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFoldersByUser(userId: string) {
    const { data, error } = await this.adminClient
      .from("folders")
      .select(
        `
        *, 
        boards(
          *,
          board_posts(post_id)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform data to include post counts
    return data?.map(folder => ({
      ...folder,
      boards: folder.boards?.map((board: { board_posts?: unknown[] }) => ({
        ...board,
        post_count: board.board_posts?.length || 0,
      })),
    }));
  }

  async updateFolder(
    folderId: string,
    updates: Database["public"]["Tables"]["folders"]["Update"]
  ) {
    const { data, error } = await this.client
      .from("folders")
      .update(updates)
      .eq("id", folderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFolder(folderId: string) {
    const { error } = await this.client
      .from("folders")
      .delete()
      .eq("id", folderId);

    if (error) throw error;
    return true;
  }

  // Boards
  async createBoard(
    boardData: Database["public"]["Tables"]["boards"]["Insert"]
  ) {
    const { data, error } = await this.adminClient
      .from("boards")
      .insert(boardData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBoardById(id: string) {
    const { data, error } = await this.adminClient
      .from("boards")
      .select("*, folders(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async getBoardByPublicId(publicId: string) {
    const { data, error } = await this.client
      .from("boards")
      .select(
        `
        *,
        folders(*),
        board_posts(
          posts(
            *,
            profiles(*)
          )
        )
      `
      )
      .eq("public_id", publicId)
      .eq("is_shared", true)
      .single();

    if (error) throw error;

    // Transform the data to match the expected format
    if (data) {
      return {
        ...data,
        posts:
          data.board_posts
            ?.map((bp: { posts: unknown; added_at: string }) => {
              const post = bp.posts as Record<string, unknown>;
              const profile = post?.profiles as Record<string, unknown>;

              if (!post) return null;

              return {
                id: post.id,
                platform: post.platform,
                platformPostId: post.platform_post_id,
                embedUrl: post.embed_url,
                caption: post.caption,
                transcript: post.transcript,
                originalUrl: post.original_url,
                metrics: post.metrics,
                datePosted: post.date_posted,
                // Instagram-specific fields
                thumbnail: post.thumbnail,
                isVideo: post.is_video,
                isCarousel: post.is_carousel,
                carouselMedia: (
                  post.carousel_media as Array<Record<string, unknown>>
                )?.map(item => ({
                  id: item.id as string,
                  type: item.type as string,
                  url: item.url as string,
                  thumbnail: item.thumbnail as string,
                  isVideo: item.is_video as boolean,
                })),
                carouselCount: post.carousel_count,
                videoUrl: post.video_url || undefined,
                displayUrl: post.display_url || undefined,
                shortcode: post.shortcode,
                dimensions: post.dimensions || undefined,
                profile: profile
                  ? {
                      id: profile.id,
                      handle: profile.handle,
                      platform: profile.platform,
                      displayName: profile.display_name,
                      bio: profile.bio,
                      followers: profile.followers_count,
                      avatarUrl: profile.avatar_url,
                      verified: profile.verified,
                    }
                  : null,
                addedAt: bp.added_at,
              };
            })
            .filter(Boolean) || [],
      };
    }

    return data;
  }

  async updateBoard(
    boardId: string,
    updates: Database["public"]["Tables"]["boards"]["Update"]
  ) {
    const { data, error } = await this.client
      .from("boards")
      .update(updates)
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async enableBoardSharing(boardId: string) {
    const { data, error } = await this.client
      .from("boards")
      .update({ is_shared: true })
      .eq("id", boardId)
      .select("public_id")
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBoard(boardId: string) {
    const { error } = await this.client
      .from("boards")
      .delete()
      .eq("id", boardId);

    if (error) throw error;
    return true;
  }

  // Board Posts
  async addPostToBoard(boardId: string, postId: string) {
    const { data, error } = await this.adminClient
      .from("board_posts")
      .insert({ board_id: boardId, post_id: postId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removePostFromBoard(boardId: string, postId: string) {
    const { error } = await this.client
      .from("board_posts")
      .delete()
      .eq("board_id", boardId)
      .eq("post_id", postId);

    if (error) throw error;
    return true;
  }

  async getPostsInBoard(boardId: string, limit = 20, offset = 0) {
    const { data, error } = await this.adminClient
      .from("board_posts")
      .select(
        `
        added_at,
        posts (
          id,
          platform,
          platform_post_id,
          embed_url,
          caption,
          transcript,
          original_url,
          metrics,
          date_posted,
          embed_html,
          thumbnail,
          is_video,
          is_carousel,
          carousel_media,
          carousel_count,
          shortcode,
          profiles (
            id,
            handle,
            platform,
            display_name,
            bio,
            followers_count,
            avatar_url,
            verified
          )
        )
      `
      )
      .eq("board_id", boardId)
      .order("added_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Transform the nested data structure
    return data
      ?.map(item => {
        const post = Array.isArray(item.posts) ? item.posts[0] : item.posts;
        const profile = Array.isArray(post?.profiles)
          ? post.profiles[0]
          : post?.profiles;

        if (!post) return null;

        return {
          id: post.id,
          platform: post.platform,
          platformPostId: post.platform_post_id,
          embedUrl: post.embed_url,
          caption: post.caption,
          transcript: post.transcript,
          originalUrl: post.original_url,
          metrics: post.metrics,
          datePosted: post.date_posted,
          embed_html: post.embed_html,
          thumbnail: post.thumbnail,
          isVideo: post.is_video,
          isCarousel: post.is_carousel,
          carouselMedia: post.carousel_media,
          carouselCount: post.carousel_count,
          shortcode: post.shortcode,
          profile: profile
            ? {
                id: profile.id,
                handle: profile.handle,
                platform: profile.platform,
                displayName: profile.display_name,
                bio: profile.bio,
                followers: profile.followers_count,
                avatarUrl: profile.avatar_url,
                verified: profile.verified,
              }
            : null,
          addedAt: item.added_at,
        };
      })
      .filter(Boolean);
  }

  // Follows
  async followProfile(userId: string, profileId: string) {
    const { data, error } = await this.adminClient
      .from("follows")
      .insert({ user_id: userId, profile_id: profileId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async unfollowProfile(userId: string, profileId: string) {
    const { error } = await this.client
      .from("follows")
      .delete()
      .eq("user_id", userId)
      .eq("profile_id", profileId);

    if (error) throw error;
    return true;
  }

  async getFollowedProfiles(userId: string) {
    const { data, error } = await this.adminClient
      .from("follows")
      .select("created_at, profiles(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data
      ?.map(item => ({
        ...item.profiles,
        // Add follow metadata
        created_at: item.created_at, // when user followed this profile
        last_updated:
          (Array.isArray(item.profiles)
            ? item.profiles[0]
            : (item.profiles as Record<string, unknown>)
          )?.last_updated ||
          (Array.isArray(item.profiles)
            ? item.profiles[0]
            : (item.profiles as Record<string, unknown>)
          )?.created_at, // when profile data was last fetched
      }))
      .filter(Boolean);
  }

  async getFollowedPosts(userId: string, limit = 50, offset = 0) {
    // Get posts directly from followed_posts table for this user
    const { data, error } = await this.adminClient
      .from("followed_posts")
      .select(
        `
        *,
        profiles(*)
      `
      )
      .eq("user_id", userId)
      .order("date_posted", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching followed posts:", error);
      throw error;
    }

    return data || [];
  }

  async isFollowing(userId: string, profileId: string) {
    const { data, error } = await this.adminClient
      .from("follows")
      .select("id")
      .eq("user_id", userId)
      .eq("profile_id", profileId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  }

  async getLastRefreshTime(userId: string) {
    const { data, error } = await this.adminClient
      .from("follows")
      .select("last_refresh")
      .eq("user_id", userId)
      .order("last_refresh", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data?.last_refresh || null;
  }

  // User Statistics
  async getUserStats(userId: string) {
    // Get folder and board counts
    const { data: folderData, error: folderError } = await this.adminClient
      .from("folders")
      .select("id, boards(id)")
      .eq("user_id", userId);

    if (folderError) throw folderError;

    // Get following count
    const { count: followingCount, error: followingError } = await this.adminClient
      .from("follows")
      .select("id", { count: "exact" })
      .eq("user_id", userId);

    if (followingError) throw followingError;

    // Get saved posts count (posts in user's boards)
    const { count: savedPostsCount, error: savedPostsError } = await this.adminClient
      .from("board_posts")
      .select("id", { count: "exact" })
      .in(
        "board_id",
        folderData?.flatMap(f => f.boards?.map(b => b.id) || []) || []
      );

    if (savedPostsError) throw savedPostsError;

    // Calculate totals
    const foldersCount = folderData?.length || 0;
    const boardsCount =
      folderData?.reduce(
        (total, folder) => total + (folder.boards?.length || 0),
        0
      ) || 0;

    return {
      folders: foldersCount,
      boards: boardsCount,
      following: followingCount || 0,
      savedPosts: savedPostsCount || 0,
    };
  }

  // Recent Activity
  async getRecentActivity(userId: string, limit = 5) {
    const activities: Array<{
      type:
        | "saved_post"
        | "followed_profile"
        | "created_board"
        | "created_folder";
      description: string;
      timestamp: string;
    }> = [];

    try {
      // Get recent saved posts
      const userFolders = await this.getFoldersByUser(userId);
      const userBoardIds =
        userFolders?.flatMap(
          f => f.boards?.map((b: { id: string }) => b.id) || []
        ) || [];

      if (userBoardIds.length > 0) {
        const { data: recentSaves } = await this.adminClient
          .from("board_posts")
          .select("added_at, boards(name), posts(platform)")
          .in("board_id", userBoardIds)
          .order("added_at", { ascending: false })
          .limit(3);

        recentSaves?.forEach(save => {
          if (save.boards && save.posts) {
            const board = Array.isArray(save.boards)
              ? save.boards[0]
              : save.boards;
            const post = Array.isArray(save.posts) ? save.posts[0] : save.posts;
            if (board && post) {
              activities.push({
                type: "saved_post",
                description: `Saved ${post.platform} post to "${board.name}"`,
                timestamp: save.added_at,
              });
            }
          }
        });
      }

      // Get recent follows
      const { data: recentFollows } = await this.adminClient
        .from("follows")
        .select("created_at, profiles(handle, platform)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

      recentFollows?.forEach(follow => {
        if (follow.profiles) {
          const profile = Array.isArray(follow.profiles)
            ? follow.profiles[0]
            : (follow.profiles as Record<string, unknown>);
          if (profile) {
            activities.push({
              type: "followed_profile",
              description: `Followed @${profile.handle} on ${profile.platform}`,
              timestamp: follow.created_at,
            });
          }
        }
      });

      // Get recent boards
      const { data: recentBoards } = await this.adminClient
        .from("boards")
        .select("created_at, name, folders(name)")
        .in("folder_id", userFolders?.map(f => f.id) || [])
        .order("created_at", { ascending: false })
        .limit(2);

      recentBoards?.forEach(board => {
        if (board.folders) {
          const folder = Array.isArray(board.folders)
            ? board.folders[0]
            : board.folders;
          if (folder) {
            activities.push({
              type: "created_board",
              description: `Created board "${board.name}" in ${folder.name}`,
              timestamp: board.created_at,
            });
          }
        }
      });

      // Get recent folders
      const { data: recentFolders } = await this.adminClient
        .from("folders")
        .select("created_at, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(2);

      recentFolders?.forEach(folder => {
        activities.push({
          type: "created_folder",
          description: `Created folder "${folder.name}"`,
          timestamp: folder.created_at,
        });
      });

      // Sort all activities by timestamp and return limited results
      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return [];
    }
  }

  async getBoardsByUser(userId: string) {
    const { data, error } = await this.client
      .from("boards")
      .select(
        `
        *,
        folders!inner(name, user_id),
        board_posts(
          posts(*)
        )
      `
      )
      .eq("folders.user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform the data to include post count and handle null folders
    return (
      data?.map(board => ({
        ...board,
        postCount: board.board_posts?.length || 0,
        folders: board.folders || { name: "Unknown Folder" },
      })) || []
    );
  }

  async getFeaturedBoards() {
    const { data, error } = await this.client
      .from("featured_boards")
      .select(
        `
        *,
        boards(
          *,
          folders(name)
        )
      `
      )
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async deleteFeaturedBoard(displayOrder: number) {
    const { error } = await this.adminClient
      .from("featured_boards")
      .delete()
      .eq("display_order", displayOrder);

    if (error) throw error;
    return true;
  }

  async createFeaturedBoard(featuredBoardData: {
    board_id: string;
    display_order: number;
    cover_image_url?: string;
    custom_title?: string;
    custom_description?: string;
  }) {
    // Temporarily only insert core fields to avoid schema cache issues
    // TODO: Re-enable custom_title and custom_description once schema cache is refreshed
    const insertData = {
      board_id: featuredBoardData.board_id,
      display_order: featuredBoardData.display_order,
      cover_image_url: featuredBoardData.cover_image_url,
    };

    const { data, error } = await this.adminClient
      .from("featured_boards")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAllUserSavedPosts(limit = 50, offset = 0) {
    // Get all user's boards
    const { data: boardPosts, error } = await this.client
      .from("board_posts")
      .select(
        `
        added_at,
        posts (
          id,
          platform,
          platform_post_id,
          embed_url,
          caption,
          transcript,
          original_url,
          metrics,
          date_posted,
          profiles (
            id,
            handle,
            platform,
            display_name,
            bio,
            followers_count,
            avatar_url,
            verified
          )
        )
      `
      )
      .order("added_at", { ascending: false });

    if (error) throw error;

    // Transform and deduplicate posts
    const uniquePosts = new Map();
    boardPosts?.forEach(item => {
      const post = Array.isArray(item.posts) ? item.posts[0] : item.posts;
      const profile = Array.isArray(post?.profiles)
        ? post.profiles[0]
        : post?.profiles;

      if (!post) return;

      // Only add if not already in map
      if (!uniquePosts.has(post.id)) {
        uniquePosts.set(post.id, {
          id: post.id,
          platform: post.platform,
          platformPostId: post.platform_post_id,
          embedUrl: post.embed_url,
          caption: post.caption,
          transcript: post.transcript,
          originalUrl: post.original_url,
          metrics: post.metrics,
          datePosted: post.date_posted,
          profile: profile
            ? {
                id: profile.id,
                handle: profile.handle,
                platform: profile.platform,
                displayName: profile.display_name,
                bio: profile.bio,
                followers: profile.followers_count,
                avatarUrl: profile.avatar_url,
                verified: profile.verified,
              }
            : null,
          addedAt: item.added_at,
        });
      }
    });

    // Convert map to array, sort by datePosted, and apply pagination
    return Array.from(uniquePosts.values())
      .sort(
        (a, b) =>
          new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
      )
      .slice(offset, offset + limit);
  }

  // Board Copying Methods
  async getBoardByUserAndCopiedFrom(userId: string, publicId: string) {
    const { data, error } = await this.client
      .from("boards")
      .select(
        `
        *,
        folders!inner(*)
      `
      )
      .eq("folders.user_id", userId)
      .eq("copied_from_public_id", publicId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  }

  async getCopiedBoardsByUser(userId: string) {
    const { data, error } = await this.client
      .from("boards")
      .select(
        `
        *,
        folders!inner(*)
      `
      )
      .eq("folders.user_id", userId)
      .not("copied_from_public_id", "is", null)
      .order("copied_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Check which boards contain a specific post by platform ID
  async getBoardsContainingPlatformPost(
    platformPostId: string,
    platform: "tiktok" | "instagram",
    userId: string
  ) {
    const { data, error } = await this.client
      .from("board_posts")
      .select(
        `
        board_id,
        boards!inner(
          id,
          name,
          folders!inner(
            id,
            name,
            user_id
          )
        ),
        posts!inner(
          platform_post_id,
          platform
        )
      `
      )
      .eq("posts.platform_post_id", platformPostId)
      .eq("posts.platform", platform)
      .eq("boards.folders.user_id", userId);

    if (error) throw error;

    return (
      data?.map(item => ({
        boardId: item.board_id,
        boardName: (item.boards as any).name,
        folderId: (item.boards as any).folders.id,
        folderName: (item.boards as any).folders.name,
      })) || []
    );
  }

  // Webhook Events
  async getWebhookEvent(stripeEventId: string) {
    const { data, error } = await this.client
      .from("webhook_events")
      .select("*")
      .eq("stripe_event_id", stripeEventId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  }

  async createWebhookEvent(eventData: {
    stripe_event_id: string;
    event_type: string;
  }) {
    const { data, error } = await this.adminClient
      .from("webhook_events")
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Subscriptions
  async getSubscriptionByUserId(userId: string) {
    const { data, error } = await this.client
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string) {
    const { data, error } = await this.adminClient
      .from("subscriptions")
      .select("*")
      .eq("stripe_subscription_id", stripeSubscriptionId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  }

  async createSubscription(subscriptionData: any) {
    const { data, error } = await this.adminClient
      .from("subscriptions")
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubscription(subscriptionId: string, updates: any) {
    const { data, error } = await this.adminClient
      .from("subscriptions")
      .update(updates)
      .eq("stripe_subscription_id", subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();
