"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Filter,
  Grid,
  List,
  ExternalLink,
  Heart,
  MessageCircle,
  Calendar,
  Bookmark,
  UserPlus,
} from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DiscoveryContentProps {
  userId: string;
}

interface Profile {
  id: string;
  handle: string;
  displayName: string;
  platform: "instagram" | "tiktok";
  followers: number;
  following: number;
  posts: number;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  isFollowing?: boolean;
}

interface Post {
  id: string;
  embedUrl: string;
  caption: string;
  thumbnail: string;
  metrics: {
    views?: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  datePosted: string;
  platform: "instagram" | "tiktok";
}

export function DiscoveryContent({ userId }: DiscoveryContentProps) {
  // userId will be used for saving posts and following profiles when API is integrated
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadPosts = useCallback(
    async (profileId: string) => {
      // profileId will be used to fetch posts from ScrapeCreators API
      setIsLoadingPosts(true);

      try {
        // Mock API call - replace with actual ScrapeCreators integration
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock posts data - will use profileId to fetch from ScrapeCreators API
        console.log("Loading posts for profile:", profileId);
        const mockPosts: Post[] = Array.from({ length: 12 }, (_, i) => ({
          id: `post-${i + 1}`,
          embedUrl: `https://example.com/embed/${i + 1}`,
          caption: `This is a sample post caption for post ${i + 1}. It contains some engaging content about entrepreneurship and creativity.`,
          thumbnail: `https://picsum.photos/400/600?random=${i + 1}`,
          metrics: {
            views: Math.floor(Math.random() * 100000) + 10000,
            likes: Math.floor(Math.random() * 5000) + 100,
            comments: Math.floor(Math.random() * 500) + 10,
            shares: Math.floor(Math.random() * 200) + 5,
          },
          datePosted: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
          platform: searchResults?.platform || "instagram",
        }));

        setPosts(mockPosts);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    },
    [searchResults]
  );

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setIsSearching(true);
      setSearchResults(null);
      setPosts([]);

      try {
        // Mock API call - replace with actual ScrapeCreators integration
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock profile data
        const mockProfile: Profile = {
          id: "1",
          handle: query.replace("@", ""),
          displayName: "Sample Creator",
          platform: query.includes("tiktok") ? "tiktok" : "instagram",
          followers: 125000,
          following: 892,
          posts: 1247,
          bio: "Content creator sharing daily inspiration and tips for entrepreneurs. Building in public 🚀",
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${query}`,
          verified: true,
          isFollowing: false,
        };

        setSearchResults(mockProfile);
        loadPosts(mockProfile.id);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [loadPosts]
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleFollowProfile = async () => {
    if (!searchResults) return;

    try {
      // Mock API call - replace with actual follow functionality
      setSearchResults({
        ...searchResults,
        isFollowing: !searchResults.isFollowing,
      });
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      // Mock API call - replace with actual save functionality
      console.log("Saving post:", postId, "for user:", userId);
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Discover Content</h1>
          <p className="text-muted-foreground">
            Search for creators and discover inspiring content from Instagram
            and TikTok
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter Instagram or TikTok handle (e.g., @username)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleSearch(searchQuery)}
              disabled={!searchQuery.trim() || isSearching}
              className="flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Results */}
      {searchResults && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Image
                    src={searchResults.avatarUrl}
                    alt={searchResults.displayName}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  {searchResults.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">
                      {searchResults.displayName}
                    </h2>
                    <Badge variant="secondary" className="capitalize">
                      {searchResults.platform}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    @{searchResults.handle}
                  </p>
                  <p className="text-sm mt-2">{searchResults.bio}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">
                      {formatNumber(searchResults.followers)}
                    </div>
                    <div className="text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {formatNumber(searchResults.following)}
                    </div>
                    <div className="text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {formatNumber(searchResults.posts)}
                    </div>
                    <div className="text-muted-foreground">Posts</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleFollowProfile}
                    variant={searchResults.isFollowing ? "outline" : "default"}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    {searchResults.isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Section */}
      {searchResults && (
        <div className="space-y-4">
          {/* Posts Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Recent Posts ({posts.length})
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Posts Grid */}
          {isLoadingPosts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              )}
            >
              {posts.map(post => (
                <Card
                  key={post.id}
                  className={cn(
                    "group overflow-hidden cursor-pointer transition-all hover:shadow-lg",
                    viewMode === "list" && "flex flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "relative",
                      viewMode === "grid" ? "aspect-[3/4]" : "w-48 aspect-[3/4]"
                    )}
                  >
                    <Image
                      src={post.thumbnail}
                      alt="Post thumbnail"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={e => {
                          e.stopPropagation();
                          handleSavePost(post.id);
                        }}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent
                    className={cn(
                      "p-4 space-y-3",
                      viewMode === "list" && "flex-1"
                    )}
                  >
                    <p className="text-sm line-clamp-2">{post.caption}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {formatNumber(post.metrics.likes)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {formatNumber(post.metrics.comments)}
                        </div>
                        {post.metrics.views && (
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-current opacity-60" />
                            {formatNumber(post.metrics.views)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.datePosted)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searchResults && !isSearching && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Discovering</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Enter an Instagram or TikTok handle to discover amazing content
              and get inspired by top creators.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setSearchQuery("@instagram");
                  handleSearch("@instagram");
                }}
              >
                Try @instagram
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setSearchQuery("@tiktok");
                  handleSearch("@tiktok");
                }}
              >
                Try @tiktok
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
