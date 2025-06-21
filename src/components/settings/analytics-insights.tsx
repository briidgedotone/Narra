"use client";

import { useState, useEffect, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  Bookmark,
  Users,
  Calendar,
  Clock,
  Download,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { DatabaseService } from "@/lib/database";
import { formatNumber, formatDate } from "@/lib/utils/format";

interface AnalyticsInsightsProps {
  userId: string;
}

interface UserStats {
  totalSavedPosts: number;
  totalBoards: number;
  totalFolders: number;
  followedProfiles: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export function AnalyticsInsights({ userId }: AnalyticsInsightsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const loadUserStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = new DatabaseService();
      const userStats = await db.getUserStats(userId);
      const recentActivity = await db.getRecentActivity(userId, 10);

      setStats({
        totalSavedPosts: userStats?.total_saved_posts || 0,
        totalBoards: userStats?.total_boards || 0,
        totalFolders: userStats?.total_folders || 0,
        followedProfiles: userStats?.followed_profiles || 0,
        recentActivity: recentActivity?.map(activity => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          timestamp: activity.timestamp,
        })) || [],
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
      // Set default values if there's an error
      setStats({
        totalSavedPosts: 0,
        totalBoards: 0,
        totalFolders: 0,
        followedProfiles: 0,
        recentActivity: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserStats();
  }, [userId, loadUserStats]);

  const mockEngagementData = [
    { platform: "TikTok", posts: 45, avgLikes: 12500, avgViews: 89000 },
    { platform: "Instagram", posts: 32, avgLikes: 8900, avgViews: 45000 },
  ];

  const mockTopCategories = [
    { name: "Marketing", count: 23, percentage: 35 },
    { name: "Design", count: 18, percentage: 27 },
    { name: "Technology", count: 12, percentage: 18 },
    { name: "Business", count: 8, percentage: 12 },
    { name: "Other", count: 5, percentage: 8 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <Bookmark className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats?.totalSavedPosts || 0)}</div>
              <div className="text-sm text-muted-foreground">Saved Posts</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mx-auto mb-2">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats?.totalBoards || 0)}</div>
              <div className="text-sm text-muted-foreground">Boards</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-2">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats?.followedProfiles || 0)}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(stats?.totalFolders || 0)}</div>
              <div className="text-sm text-muted-foreground">Folders</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEngagementData.map((platform) => (
              <div key={platform.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={platform.platform === "TikTok" ? "default" : "secondary"}>
                      {platform.platform}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {platform.posts} posts saved
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Avg Likes: {formatNumber(platform.avgLikes)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>Avg Views: {formatNumber(platform.avgViews)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Content Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTopCategories.map((category, index) => (
              <div key={category.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {category.count} posts ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{activity.description}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity to display</p>
              <p className="text-sm">Start saving posts to see your activity here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download your data for backup or analysis purposes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Saved Posts</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Export all your saved posts with metadata
                </p>
                <button className="text-sm text-primary hover:underline">
                  Download CSV
                </button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Boards & Folders</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Export your organization structure
                </p>
                <button className="text-sm text-primary hover:underline">
                  Download JSON
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 