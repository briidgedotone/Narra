"use client";

import { Instagram, Music, Search } from "lucide-react";
import { useState } from "react";

import { PostGrid } from "@/components/discovery/post-grid";
import { ProfileCard } from "@/components/discovery/profile-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  InstagramProfileData,
  TikTokProfileData,
  TikTokVideosData,
} from "@/types/api";

export function DiscoveryContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "tiktok">("instagram");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    InstagramProfileData | TikTokProfileData | TikTokVideosData | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/discovery/search?platform=${platform}&handle=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || "Search failed");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="content-spacing max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🔍 Discover Content
        </h1>
        <p className="text-muted-foreground">
          Search Instagram and TikTok profiles for inspiration
        </p>
      </div>

      {/* Search Interface - Sticky on larger screens when results are shown */}
      <div className={`mb-6 ${results ? "lg:sticky lg:top-4 lg:z-10" : ""}`}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Search Social Media Profiles</CardTitle>
            <CardDescription>
              Find inspiration from Instagram and TikTok creators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform Toggle */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={platform === "instagram" ? "default" : "outline"}
                onClick={() => setPlatform("instagram")}
                className="flex items-center gap-2"
                size="sm"
              >
                <Instagram size={16} />
                <span className="hidden sm:inline">Instagram</span>
                <span className="sm:hidden">IG</span>
              </Button>
              <Button
                variant={platform === "tiktok" ? "default" : "outline"}
                onClick={() => setPlatform("tiktok")}
                className="flex items-center gap-2"
                size="sm"
              >
                <Music size={16} />
                <span className="hidden sm:inline">TikTok</span>
                <span className="sm:hidden">TT</span>
              </Button>
            </div>

            {/* Search Input - Better responsive layout */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative min-w-0">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Enter ${platform} username (e.g., ${platform === "instagram" ? "nike" : "charlidamelio"})`}
                  className="pr-10 w-full"
                />
                <Search
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  size={20}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="w-full md:w-auto md:min-w-[120px] md:flex-shrink-0"
                size="default"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-6">
          {/* Clear Results Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Results for @{searchQuery}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResults(null)}
            >
              Clear Results
            </Button>
          </div>

          {/* Profile Card */}
          {(platform === "instagram" ||
            (platform === "tiktok" &&
              (results as TikTokProfileData)?.user)) && (
            <ProfileCard
              profile={results as InstagramProfileData | TikTokProfileData}
              platform={platform}
            />
          )}

          {/* Posts Grid */}
          {platform === "instagram" &&
            (results as InstagramProfileData)?.user
              ?.edge_owner_to_timeline_media?.edges && (
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Posts</h3>
                <PostGrid
                  posts={
                    (
                      results as InstagramProfileData
                    ).user.edge_owner_to_timeline_media?.edges?.map(
                      edge => edge.node
                    ) || []
                  }
                  platform={platform}
                />
              </div>
            )}

          {platform === "tiktok" && (results as TikTokVideosData)?.videos && (
            <div>
              <h3 className="text-lg font-medium mb-4">Recent Videos</h3>
              <PostGrid
                posts={(results as TikTokVideosData).videos}
                platform={platform}
              />
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">
            Searching {platform} for &ldquo;{searchQuery}&rdquo;...
          </p>
        </div>
      )}
    </div>
  );
}
