import { BookOpen, Users, Folder, FolderPlus } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  type: "saved_post" | "followed_profile" | "created_board" | "created_folder";
  description: string;
  timestamp: string;
  className?: string;
}

export function ActivityItem({
  type,
  description,
  timestamp,
  className,
}: ActivityItemProps) {
  const getIcon = () => {
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
        return Folder;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "saved_post":
        return "text-blue-500";
      case "followed_profile":
        return "text-green-500";
      case "created_board":
        return "text-purple-500";
      case "created_folder":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const Icon = getIcon();

  return (
    <div className={cn("flex items-start space-x-3 py-3", className)}>
      <div className={`p-2 rounded-full bg-muted ${getIconColor()}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
