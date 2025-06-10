"use client";

import { Folder, Users, BookOpen, Settings } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { StatsCard, ActivityItem, QuickActions } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/database";

import {
  DashboardSettingsModal,
  useDashboardSettings,
} from "./dashboard-settings";

interface DashboardContentProps {
  userId: string;
}

// Types for the data returned by database functions
interface UserStats {
  folders: number;
  boards: number;
  following: number;
  savedPosts: number;
}

interface RecentActivity {
  type: "saved_post" | "followed_profile" | "created_board" | "created_folder";
  description: string;
  timestamp: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[] | null>(
    null
  );
  const [activityError, setActivityError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Dashboard settings
  const { settings, updateSettings } = useDashboardSettings();

  // Function to refresh dashboard data
  const refreshDashboard = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      // Fetch user statistics
      try {
        const stats = await db.getUserStats(userId);
        setUserStats(stats);
        setStatsError(null);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setStatsError(error instanceof Error ? error.message : "Unknown error");
      }

      // Fetch recent activity
      try {
        const activity = await db.getRecentActivity(userId);
        setRecentActivity(activity);
        setActivityError(null);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        setActivityError(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    fetchDashboardData();
  }, [userId, refreshKey]);

  // Apply view mode styles
  const getSpacing = () => {
    return settings.viewMode === "compact" ? "mb-6" : "mb-8";
  };

  const getContentSpacing = () => {
    return settings.viewMode === "compact"
      ? "content-spacing-compact"
      : "content-spacing";
  };

  return (
    <div className={getContentSpacing()}>
      {/* Dashboard Header with Settings */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your content.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Customize
        </Button>
      </div>

      {/* Stats Cards */}
      {settings.showStats && (
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${getSpacing()}`}
        >
          <StatsCard
            icon={Folder}
            label="Folders & Boards"
            value={userStats ? userStats.folders + userStats.boards : 0}
            loading={!userStats && !statsError}
          />
          <StatsCard
            icon={Users}
            label="Following"
            value={userStats ? userStats.following : 0}
            loading={!userStats && !statsError}
          />
          <StatsCard
            icon={BookOpen}
            label="Saved Posts"
            value={userStats ? userStats.savedPosts : 0}
            loading={!userStats && !statsError}
          />
        </div>
      )}

      {/* Recent Activity */}
      {settings.showActivity && (
        <Card className={getSpacing()}>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div>
                {recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={`${activity.type}-${activity.timestamp}-${index}`}
                    type={activity.type}
                    description={activity.description}
                    timestamp={activity.timestamp}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {activityError
                    ? "Unable to load activity"
                    : "No recent activity yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start by discovering content or creating folders to see your
                  activity here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {settings.showQuickActions && (
        <div className={getSpacing()}>
          <QuickActions userId={userId} onSuccess={refreshDashboard} />
        </div>
      )}

      {/* Settings Modal */}
      <DashboardSettingsModal
        settings={settings}
        onSettingsChange={updateSettings}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
