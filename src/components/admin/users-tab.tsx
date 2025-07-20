"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/basic-data-table";
import { getAdminUsers } from "@/app/actions/admin-users";

type User = {
  id: string;
  email: string;
  role: "user" | "admin";
  joinedAt: string;
  postsCount: number;
  boardsCount: number;
};

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminUsers();
      
      if (result.success) {
        setUsers(result.users);
      } else {
        setError(result.error || "Failed to load users");
        console.error("Failed to load users:", result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    {
      key: "email" as const,
      header: "Email",
      sortable: true,
    },
    {
      key: "role" as const,
      header: "Role",
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === "admin" ? "default" : "outline"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "postsCount" as const,
      header: "Saved Posts",
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{value.toLocaleString()}</span>
      ),
    },
    {
      key: "boardsCount" as const,
      header: "Boards",
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{value.toLocaleString()}</span>
      ),
    },
    {
      key: "joinedAt" as const,
      header: "Joined",
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(date);
      },
    },
  ];

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-medium">Users</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage and monitor user accounts across the platform.
        </p>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-lg font-medium">Users</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage and monitor user accounts across the platform.
        </p>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">Error loading users: {error}</p>
            <button
              onClick={loadUsers}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium">Users</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Manage and monitor user accounts across the platform.
      </p>
      <DataTable
        data={users}
        columns={columns}
        searchable
        itemsPerPage={10}
        hoverable
      />
    </div>
  );
}
