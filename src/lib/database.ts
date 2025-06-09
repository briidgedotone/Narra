import type { Database } from "@/types/database";

import { createAdminClient, supabase } from "./supabase";

// Generic database operations
export class DatabaseService {
  private client = supabase;
  private adminClient = createAdminClient();

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
    const { data, error } = await this.client
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
    const { data, error } = await this.client
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Profiles
  async createProfile(
    profileData: Database["public"]["Tables"]["profiles"]["Insert"]
  ) {
    const { data, error } = await this.client
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
    const { data, error } = await this.client
      .from("posts")
      .insert(postData)
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

  // Folders
  async createFolder(
    folderData: Database["public"]["Tables"]["folders"]["Insert"]
  ) {
    const { data, error } = await this.client
      .from("folders")
      .insert(folderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFoldersByUser(userId: string) {
    const { data, error } = await this.client
      .from("folders")
      .select("*, boards(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  // Boards
  async createBoard(
    boardData: Database["public"]["Tables"]["boards"]["Insert"]
  ) {
    const { data, error } = await this.client
      .from("boards")
      .insert(boardData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBoardById(id: string) {
    const { data, error } = await this.client
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
      .select("*, folders(*)")
      .eq("public_id", publicId)
      .eq("is_shared", true)
      .single();

    if (error) throw error;
    return data;
  }

  // Board Posts
  async addPostToBoard(boardId: string, postId: string) {
    const { data, error } = await this.client
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
    const { data, error } = await this.client
      .from("board_posts")
      .select("posts(*, profiles(*))")
      .eq("board_id", boardId)
      .order("added_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data?.map(item => item.posts).filter(Boolean);
  }

  // Follows
  async followProfile(userId: string, profileId: string) {
    const { data, error } = await this.client
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
    const { data, error } = await this.client
      .from("follows")
      .select("profiles(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data?.map(item => item.profiles).filter(Boolean);
  }

  async isFollowing(userId: string, profileId: string) {
    const { data, error } = await this.client
      .from("follows")
      .select("id")
      .eq("user_id", userId)
      .eq("profile_id", profileId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  }

  // Subscriptions
  async createSubscription(
    subscriptionData: Database["public"]["Tables"]["subscriptions"]["Insert"]
  ) {
    const { data, error } = await this.adminClient
      .from("subscriptions")
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSubscriptionByUserId(userId: string) {
    const { data, error } = await this.client
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async updateSubscription(
    userId: string,
    updates: Database["public"]["Tables"]["subscriptions"]["Update"]
  ) {
    const { data, error } = await this.adminClient
      .from("subscriptions")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const db = new DatabaseService();
