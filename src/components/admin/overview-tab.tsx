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

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newUsersThisMonth } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

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
      newUsersThisMonth: newUsersThisMonth || 0,
      totalCollections: totalCollections || 0,
      totalPosts: totalPosts || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      newUsersThisMonth: 0,
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
    newUsersThisMonth: 0,
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
    // Close dropdown immediately for better UX
    setOpenDropdown(null);
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    position: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Find the featured board for this position
    const featuredBoard = featuredBoards.find(
      fb => fb.display_order === position
    );
    if (!featuredBoard) return;

    setUpdatingPosition(position);

    try {
      // Create a FormData object to upload the image
      const formData = new FormData();
      formData.append("file", file);
      formData.append("position", position.toString());

      // Upload the image to our API endpoint
      const uploadResponse = await fetch("/api/upload-featured-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to upload image"
        );
      }

      const { imageUrl } = await uploadResponse.json();

      // Update the featured board with the new image URL
      const result = await setFeaturedBoard(
        featuredBoard.board_id,
        position,
        imageUrl,
        featuredBoard.boards?.name,
        `Featured collection from ${featuredBoard.boards?.folders?.name || "Unknown folder"}`
      );

      if (result.success) {
        await loadFeaturedBoards();
        console.log(
          `Successfully updated image for Featured Collection ${position}`
        );
      } else {
        console.error("Failed to update featured board image:", result.error);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUpdatingPosition(null);
      // Reset the file input
      event.target.value = "";
    }
  };

  const handleRemoveImage = async (position: number) => {
    // Find the featured board for this position
    const featuredBoard = featuredBoards.find(
      fb => fb.display_order === position
    );
    if (!featuredBoard) return;

    setUpdatingPosition(position);

    try {
      // Update the featured board to remove the image (set cover_image_url to null)
      const result = await setFeaturedBoard(
        featuredBoard.board_id,
        position,
        null, // Remove the image
        featuredBoard.boards?.name,
        `Featured collection from ${featuredBoard.boards?.folders?.name || "Unknown folder"}`
      );

      if (result.success) {
        await loadFeaturedBoards();
        console.log(
          `Successfully removed image from Featured Collection ${position}`
        );
      } else {
        console.error("Failed to remove featured board image:", result.error);
      }
    } catch (error) {
      console.error("Failed to remove image:", error);
    } finally {
      setUpdatingPosition(null);
    }
  };

  const handleRemoveFromFeatured = async (position: number) => {
    // Find the featured board for this position
    const featuredBoard = featuredBoards.find(
      fb => fb.display_order === position
    );
    if (!featuredBoard) return;

    setUpdatingPosition(position);

    try {
      // Delete the featured board entry using the deleteFeaturedBoard action
      const { deleteFeaturedBoard } = await import("@/app/actions/folders");
      const result = await deleteFeaturedBoard(position);

      if (result.success) {
        await loadFeaturedBoards();
        console.log(
          `Successfully removed board from Featured Collection ${position}`
        );
      } else {
        console.error("Failed to remove featured board:", result.error);
      }
    } catch (error) {
      console.error("Failed to remove from featured:", error);
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
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          <div className="text-left p-8">
            <div className="text-3xl font-bold mb-2 text-foreground">
              {formatNumber(stats.totalUsers)}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-foreground">
                Total Users
              </span>
            </div>
          </div>

          <div className="text-left p-8">
            <div className="text-3xl font-bold mb-2 text-foreground">
              {formatNumber(stats.newUsersThisMonth)}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-foreground">
                Users This Month
              </span>
            </div>
          </div>

          <div className="text-left p-8">
            <div className="text-3xl font-bold mb-2 text-foreground">
              {formatNumber(stats.totalCollections)}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-foreground">
                Total Collections
              </span>
            </div>
          </div>

          <div className="text-left p-8">
            <div className="text-3xl font-bold mb-2 text-foreground">
              {formatNumber(stats.totalPosts)}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-medium text-foreground">
                Total Posts
              </span>
            </div>
          </div>
        </div>
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

                  {/* Featured Label */}
                  {featuredBoard && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full shadow-sm border border-gray-200">
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Clean Actions Overlay */}
                  {featuredBoard &&
                    updatingPosition !== collection.position && (
                      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg">
                        {/* Action Buttons Group - Top Right */}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {/* Upload/Change Image */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e =>
                              handleImageUpload(e, collection.position)
                            }
                            className="hidden"
                            id={`upload-${collection.position}`}
                          />
                          <label
                            htmlFor={`upload-${collection.position}`}
                            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white shadow-sm transition-colors"
                            title={
                              featuredBoard.cover_image_url
                                ? "Change image"
                                : "Upload image"
                            }
                          >
                            <svg
                              className="w-4 h-4 text-gray-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </label>

                          {/* Remove Image (only if image exists) */}
                          {featuredBoard.cover_image_url && (
                            <button
                              onClick={() =>
                                handleRemoveImage(collection.position)
                              }
                              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 shadow-sm transition-colors"
                              title="Remove image"
                            >
                              <svg
                                className="w-4 h-4 text-gray-700 hover:text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}

                          {/* Remove from Featured */}
                          <button
                            onClick={() =>
                              handleRemoveFromFeatured(collection.position)
                            }
                            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 shadow-sm transition-colors"
                            title="Remove from featured"
                          >
                            <svg
                              className="w-4 h-4 text-gray-700 hover:text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
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
                    {loading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">
                          Loading boards...
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
                                  if (!isAlreadyFeatured) {
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
