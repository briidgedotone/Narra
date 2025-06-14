"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FolderPlus, BookOpen, Users } from "@/components/ui/icons";

import { CreateFolderModal } from "./create-folder-modal";

interface QuickActionsProps {
  userId: string;
  onSuccess?: () => void;
}

export function QuickActions({ userId, onSuccess }: QuickActionsProps) {
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setIsLoading(action);

    // Simulate action
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(null);
    onSuccess?.();
  };

  const handleFolderCreated = () => {
    setCreateFolderOpen(false);
    onSuccess?.();
  };

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
      icon: FolderPlus,
      action: () => handleAction("create-folder"),
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
              const loading = isLoading === action.id;

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
                      className="h-auto p-4 flex flex-col items-center space-y-2 w-full"
                      disabled={loading}
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
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={action.action}
                  disabled={loading}
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

      <CreateFolderModal
        userId={userId}
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSuccess={handleFolderCreated}
      />
    </>
  );
}
