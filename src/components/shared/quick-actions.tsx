"use client";

import React, { useState, Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, PlusCircle, BookOpen, Users } from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";

// Lazy load the CreateFolderModal component to reduce initial bundle size
const CreateFolderModal = React.lazy(() =>
  import("./create-folder-modal").then(module => ({
    default: module.CreateFolderModal,
  }))
);

interface QuickActionsProps {
  userId: string;
  onSuccess?: () => void;
}

export function QuickActions({ userId, onSuccess }: QuickActionsProps) {
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const handleFolderCreated = () => {
    setCreateFolderOpen(false);
    onSuccess?.();
  };

  // Debug log
  // console.log("QuickActions render:", { createFolderOpen, userId });

  const actions = [
    {
      id: "discover",
      label: "Discover Content",
      description: "Find new creators and posts",
      icon: Search,
      href: "/discovery",
    },
    {
      id: "create-folder",
      label: "Create Folder",
      description: "Organize your content",
      icon: PlusCircle,
      action: () => setCreateFolderOpen(true),
    },
    {
      id: "saved-posts",
      label: "View Saved Posts",
      description: "Browse your collection",
      icon: BookOpen,
      href: "/saved",
    },
    {
      id: "following",
      label: "Manage Following",
      description: "See who you follow",
      icon: Users,
      href: "/following",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {actions.map(action => {
              const Icon = action.icon;

              // If it has an href, render as a link
              if (action.href) {
                return (
                  <a
                    key={action.id}
                    href={action.href}
                    className="inline-block"
                  >
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2 w-full cursor-pointer"
                    >
                      <Icon className="h-6 w-6" />
                      <div className="text-center">
                        <p className="text-sm font-medium">{action.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </Button>
                  </a>
                );
              }

              // Otherwise render as a button with onClick
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 cursor-pointer"
                  onClick={action.action}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lazy-loaded Create Folder Modal */}
      {createFolderOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-8">
                <div className="flex flex-col items-center space-y-4">
                  <LoadingSpinner className="h-6 w-6" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            </div>
          }
        >
          <CreateFolderModal
            userId={userId}
            open={createFolderOpen}
            onOpenChange={setCreateFolderOpen}
            onSuccess={handleFolderCreated}
          />
        </Suspense>
      )}
    </>
  );
}
