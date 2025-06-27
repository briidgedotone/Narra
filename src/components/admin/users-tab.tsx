"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/basic-data-table";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  joinedAt: string;
  postsCount: number;
  boardsCount: number;
};

const mockUsers: User[] = [
  {
    id: "1",
    name: "Olivia Martin",
    email: "olivia@example.com",
    role: "user",
    joinedAt: "2024-01-15",
    postsCount: 156,
    boardsCount: 12,
  },
  {
    id: "2",
    name: "Jackson Lee",
    email: "jackson@example.com",
    role: "admin",
    joinedAt: "2023-12-01",
    postsCount: 432,
    boardsCount: 28,
  },
  {
    id: "3",
    name: "Isabella Nguyen",
    email: "isabella@example.com",
    role: "user",
    joinedAt: "2024-02-10",
    postsCount: 89,
    boardsCount: 5,
  },
  {
    id: "4",
    name: "William Kim",
    email: "william@example.com",
    role: "user",
    joinedAt: "2024-01-20",
    postsCount: 267,
    boardsCount: 15,
  },
  {
    id: "5",
    name: "Sofia Davis",
    email: "sofia@example.com",
    role: "user",
    joinedAt: "2023-11-15",
    postsCount: 543,
    boardsCount: 31,
  },
];

export function UsersTab() {
  const columns = [
    {
      key: "name" as const,
      header: "Name",
      sortable: true,
    },
    {
      key: "email" as const,
      header: "Email",
      sortable: true,
    },
    {
      key: "role" as const,
      header: "Role",
      sortable: true,
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
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

  return (
    <div>
      <h2 className="text-lg font-medium">Users</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Manage and monitor user accounts across the platform.
      </p>
      <DataTable
        data={mockUsers}
        columns={columns}
        searchable
        itemsPerPage={10}
        hoverable
      />
    </div>
  );
}
