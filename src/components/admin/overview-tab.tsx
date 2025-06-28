"use client";

import { useState, useEffect } from "react";

import {
  getFeaturedBoards,
  getAdminBoards,
  setFeaturedBoard,
} from "@/app/actions/folders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle } from "@/components/ui/icons";
import { supabase } from "@/lib/supabase";

// Function to fetch real admin stats
async function getAdminStats() {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_sign_in_at", thirtyDaysAgo.toISOString());

    // Get total boards count (collections)
    const { count: totalCollections } = await supabase
      .from("boards")
      .select("*", { count: "exact", head: true });

    // Get total posts count
    const { count: totalPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalCollections: totalCollections || 0,
      totalPosts: totalPosts || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalCollections: 0,
      totalPosts: 0,
    };
  }
}

interface Board {
  id: string;
  name: string;
  postCount: number;
  folders?: { name: string } | null;
}

export function OverviewTab() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCollections: 0,
    totalPosts: 0,
  });
  const [featuredBoards, setFeaturedBoards] = useState<
    Array<{
      id: string;
      display_order: number;
      title?: string;
      description?: string;
      cover_image_url?: string;
      board_id: string;
      boards?: {
        id: string;
        name: string;
        folders?: { name: string };
      };
    }>
  >([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingPosition, setUpdatingPosition] = useState<number | null>(null);

  useEffect(() => {
    loadStats();
    loadFeaturedBoards();
  }, []);

  useEffect(() => {
    if (openDropdown !== null) {
      loadAdminBoards();
    }
  }, [openDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openDropdown !== null && !target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }

    // Return undefined explicitly for the case when openDropdown is null
    return undefined;
  }, [openDropdown]);

  const loadStats = async () => {
    const adminStats = await getAdminStats();
    setStats(adminStats);
  };

  const loadFeaturedBoards = async () => {
    const result = await getFeaturedBoards();
    if (result.success) {
      setFeaturedBoards(result.data || []);
    }
  };

  const loadAdminBoards = async () => {
    setLoading(true);
    try {
      const result = await getAdminBoards();
      if (result.success) {
        setBoards(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBoard = async (board: Board, position: number) => {
    setUpdatingPosition(position);
    try {
      // Generate a better cover image URL using a placeholder service with the board name
      const coverImageUrl = `https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=${encodeURIComponent(board.name)}`;

      const result = await setFeaturedBoard(
        board.id,
        position,
        coverImageUrl,
        board.name,
        `Featured collection from ${board.folders?.name || "Unknown folder"} with ${board.postCount} posts`
      );

      if (result.success) {
        await loadFeaturedBoards();
        setOpenDropdown(null);
        // You could add a toast notification here for success
        console.log(
          `Successfully set "${board.name}" as Featured Collection ${position}`
        );
      } else {
        console.error("Failed to set featured board:", result.error);
      }
    } catch (error) {
      console.error("Failed to set featured board:", error);
    } finally {
      setUpdatingPosition(null);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const activeUserPercentage =
    stats.totalUsers > 0
      ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
      : "0.0";

  // Empty state collections for admin
  const emptyCollections = [
    {
      position: 1,
      title: "Featured Collection 1",
      description: "Select a board to feature as your first collection",
      backgroundColor: "#FF6B6B",
    },
    {
      position: 2,
      title: "Featured Collection 2",
      description: "Select a board to feature as your second collection",
      backgroundColor: "#4ECDC4",
    },
    {
      position: 3,
      title: "Featured Collection 3",
      description: "Select a board to feature as your third collection",
      backgroundColor: "#45B7D1",
    },
    {
      position: 4,
      title: "Featured Collection 4",
      description: "Select a board to feature as your fourth collection",
      backgroundColor: "#96CEB4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalUsers)}
            </div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.activeUsers)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeUserPercentage}% of total users
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collections
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalCollections)}
            </div>
            <p className="text-xs text-muted-foreground">Created boards</p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalPosts)}
            </div>
            <p className="text-xs text-muted-foreground">Saved posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Collections */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {emptyCollections.map(collection => {
            // Check if this position has a featured board
            const featuredBoard = featuredBoards.find(
              fb => fb.display_order === collection.position
            );

            return (
              <div
                key={collection.position}
                className="relative dropdown-container"
              >
                <div
                  className="aspect-[4/3] rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === collection.position
                        ? null
                        : collection.position
                    )
                  }
                  style={{
                    backgroundColor: collection.backgroundColor,
                    backgroundImage: featuredBoard?.cover_image_url
                      ? `url(${featuredBoard.cover_image_url})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Loading overlay for this specific position */}
                  {updatingPosition === collection.position && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                        <p className="text-sm">Updating...</p>
                      </div>
                    </div>
                  )}

                  {!featuredBoard &&
                    updatingPosition !== collection.position && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <PlusCircle className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}

                  {/* Success indicator for featured boards */}
                  {featuredBoard &&
                    updatingPosition !== collection.position && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                </div>
                <div className="mt-3">
                  <h3 className="font-medium text-sm">
                    {featuredBoard?.title || collection.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {featuredBoard?.description || collection.description}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {updatingPosition === collection.position
                      ? "Updating..."
                      : featuredBoard
                        ? "Click to change"
                        : "Click to select board"}
                  </span>
                </div>

                {/* Dropdown */}
                {openDropdown === collection.position && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {loading || updatingPosition !== null ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">
                          {updatingPosition !== null
                            ? "Updating collection..."
                            : "Loading boards..."}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {boards.length === 0 ? (
                          <p className="text-sm text-gray-500 p-2">
                            No boards found
                          </p>
                        ) : (
                          boards.map(board => {
                            // Check if this board is already featured
                            const isAlreadyFeatured = featuredBoards.some(
                              fb => fb.board_id === board.id
                            );

                            return (
                              <div
                                key={board.id}
                                onClick={() => {
                                  if (
                                    !isAlreadyFeatured &&
                                    updatingPosition === null
                                  ) {
                                    handleSelectBoard(
                                      board,
                                      collection.position
                                    );
                                  }
                                }}
                                className={`p-3 cursor-pointer rounded border-b border-gray-100 last:border-b-0 ${
                                  isAlreadyFeatured
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">
                                      {board.name}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {board.folders?.name || "No folder"} •{" "}
                                      {board.postCount} posts
                                    </p>
                                  </div>
                                  {isAlreadyFeatured && (
                                    <div className="ml-2">
                                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                        Featured
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
