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
  ArrowLeft01Icon,
  ArrowRight01Icon,
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
  Folder01Icon,
  Folder02Icon,
  PlusSignCircleIcon,
  FilterIcon,
  ViewIcon,
  Menu02Icon,
  LinkSquare01Icon,
  FavouriteIcon,
  MessageMultiple01Icon,
  Share01Icon,
  UserAdd01Icon,
  SearchList01Icon,
  TiktokIcon,
  InstagramIcon,
  TimeQuarterIcon,
  FavouriteCircleIcon,
  Calendar03Icon,
  LaptopVideoIcon,
  SecurityIcon,
  PlayIcon,
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
export const ChevronLeft = ArrowLeft01Icon;
export const ChevronRight = ArrowRight01Icon;
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

// Specific folder icons for open/closed states
export const FolderClosed = Folder01Icon;
export const FolderOpen = Folder02Icon;

// Plus icon for create actions
export const PlusCircle = PlusSignCircleIcon;

// Discovery page icons
export const Filter = FilterIcon;
export const Grid = ViewIcon;
export const List = Menu02Icon;
export const ExternalLink = LinkSquare01Icon;
export const Heart = FavouriteIcon;
export const MessageCircle = MessageMultiple01Icon;
export const Share = Share01Icon;
export const UserPlus = UserAdd01Icon;
export const Play = PlayIcon;

// EmptyState component icons - using existing icons as alternatives
export const FileText = AiBookIcon; // Using book icon as alternative to file text
export const Link = LinkSquare01Icon; // Using existing link icon
export const Files = AiFolder01Icon; // Using folder icon as alternative to files
export const Search02 = AiSearchIcon; // Using existing search icon
export const MessageSquare = MessageMultiple01Icon; // Using existing message icon
export const Mail = MessageMultiple01Icon; // Using message icon as alternative to mail
export const Image = ViewIcon; // Using view icon as alternative to image
export const FileQuestion = AlertCircleIcon; // Using alert circle as alternative

// Export the icon type for compatibility
export type IconType = React.ComponentType<{
  className?: string;
  size?: number | string;
  color?: string;
}>;

// For components that use LucideIcon type
export type LucideIcon = IconType;

// New filter icons
export const SearchList = SearchList01Icon;
export const TikTok = TiktokIcon;
export const Instagram = InstagramIcon;
export const TimeQuarter = TimeQuarterIcon;
export const FavouriteCircle = FavouriteCircleIcon;
export const Calendar03 = Calendar03Icon;
export const LaptopVideo = LaptopVideoIcon;
export const Shield = SecurityIcon;
