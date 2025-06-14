// Centralized icon mapping from Lucide to Huge Icons
// This allows us to maintain the same icon names while using Huge Icons library

import {
  Home01Icon,
  AiSearchIcon,
  AllBookmarkIcon,
  UserGroupIcon,
  AccountSetting01Icon,
  Menu01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  EyeIcon,
  EyeIcon as EyeOffIcon, // Using same icon for now
  FolderShared01Icon,
  Edit01Icon,
  Delete01Icon,
  RefreshIcon,
  AlertCircleIcon,
  CursorInfo01Icon,
  CursorLoading01Icon,
  LockIcon,
  GlobeIcon,
  AiBookIcon,
  AiFolder01Icon,
  FolderAddIcon,
  GridIcon,
  Calendar01Icon,
  ClipboardIcon,
} from "hugeicons-react";

// Export all icons with their original Lucide names for compatibility
export const Home = Home01Icon;
export const Search = AiSearchIcon;
export const Bookmark = AllBookmarkIcon;
export const Users = UserGroupIcon;
export const Settings = AccountSetting01Icon;
export const Menu = Menu01Icon;
export const X = Cancel01Icon;
export const Check = CheckmarkCircle01Icon;
export const ChevronDown = ArrowDown01Icon;
export const ChevronUp = ArrowUp01Icon;
export const Eye = EyeIcon;
export const EyeOff = EyeOffIcon;
export const Share2 = FolderShared01Icon;
export const Edit = Edit01Icon;
export const Trash2 = Delete01Icon;
export const RefreshCw = RefreshIcon;
export const AlertCircle = AlertCircleIcon;
export const Info = CursorInfo01Icon;
export const Loader2 = CursorLoading01Icon;
export const Lock = LockIcon;
export const Globe = GlobeIcon;
export const BookOpen = AiBookIcon;
export const Folder = AiFolder01Icon;
export const FolderPlus = FolderAddIcon;
export const Hash = GridIcon;
export const Calendar = Calendar01Icon;
export const Clipboard = ClipboardIcon;

// Export the icon type for compatibility
export type IconType = React.ComponentType<{
  className?: string;
  size?: number | string;
  color?: string;
}>;

// For components that use LucideIcon type
export type LucideIcon = IconType;
