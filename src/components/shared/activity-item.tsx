import { BookOpen, Users, Folder, FolderPlus } from "lucide-react";

interface ActivityItemProps {
  type: "saved_post" | "followed_profile" | "created_board" | "created_folder";
  description: string;
  timestamp: string;
}

function getActivityIcon(type: ActivityItemProps["type"]) {
  switch (type) {
    case "saved_post":
      return BookOpen;
    case "followed_profile":
      return Users;
    case "created_board":
      return Folder;
    case "created_folder":
      return FolderPlus;
    default:
      return BookOpen;
  }
}

function getRelativeTime(timestamp: string) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}

export function ActivityItem({
  type,
  description,
  timestamp,
}: ActivityItemProps) {
  const Icon = getActivityIcon(type);

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-border last:border-0">
      <div className="p-2 bg-muted rounded-lg">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {getRelativeTime(timestamp)}
        </p>
      </div>
    </div>
  );
}
