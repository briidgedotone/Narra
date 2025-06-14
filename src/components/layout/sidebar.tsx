"use client";

import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import {
  Home,
  Search,
  Bookmark,
  Users,
  Settings,
  Clipboard,
  FolderClosed,
  FolderOpen,
  PlusCircle,
} from "@/components/ui/icons";

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Discovery", href: "/discovery", icon: Search },
  { name: "Saved Posts", href: "/saved", icon: Bookmark },
  { name: "Following", href: "/following", icon: Users },
  {
    name: "Create Board",
    href: "/boards/create",
    icon: PlusCircle,
    special: true,
  },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

// Types for sidebar data
interface SidebarBoard {
  id: number;
  name: string;
  href: string;
}

interface SidebarFolder {
  id: number;
  name: string;
  boards: SidebarBoard[];
}

// Mock data for folders and boards - replace with real data later
const mockFolders: SidebarFolder[] = [
  {
    id: 1,
    name: "Marketing Ideas",
    boards: [
      { id: 1, name: "Social Media", href: "/boards/1" },
      { id: 2, name: "Email Campaigns", href: "/boards/2" },
    ],
  },
  {
    id: 2,
    name: "Design Inspiration",
    boards: [
      { id: 3, name: "UI/UX", href: "/boards/3" },
      { id: 4, name: "Branding", href: "/boards/4" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  // Initialize expanded folders from localStorage
  const [expandedFolders, setExpandedFolders] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("narra-expanded-folders");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [folders, setFolders] = useState<SidebarFolder[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("narra-folders");
      return saved ? JSON.parse(saved) : mockFolders;
    }
    return mockFolders;
  });

  // Persist expanded folders to localStorage
  useEffect(() => {
    localStorage.setItem(
      "narra-expanded-folders",
      JSON.stringify(expandedFolders)
    );
  }, [expandedFolders]);

  // Persist folders to localStorage
  useEffect(() => {
    localStorage.setItem("narra-folders", JSON.stringify(folders));
  }, [folders]);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const createNewBoard = (folderId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent folder toggle when clicking plus

    const newBoardId = Date.now(); // Simple ID generation
    const newBoard: SidebarBoard = {
      id: newBoardId,
      name: "Untitled Board",
      href: `/boards/${newBoardId}`,
    };

    setFolders((prev: SidebarFolder[]) =>
      prev.map((folder: SidebarFolder) =>
        folder.id === folderId
          ? { ...folder, boards: [...folder.boards, newBoard] }
          : folder
      )
    );

    // Expand the folder if it's not already expanded
    if (!expandedFolders.includes(folderId)) {
      setExpandedFolders(prev => [...prev, folderId]);
    }

    // Navigate to the new board
    router.push(newBoard.href);
  };

  return (
    <div className="sidebar-narra h-full flex flex-col">
      {/* Brand Header */}
      <div className="p-3 border-[var(--sidebar-border-color)]">
        <h2 className="sidebar-brand text-lg font-semibold">Use Narra</h2>
        <p className="text-xs text-[var(--sidebar-text-secondary)] mt-1">
          Content Curation Platform
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 py-3 space-y-1">
        {mainNavigation.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isCreateBoard = item.special;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-nav-item flex px-2 items-center rounded-md text-sm font-medium ${
                isActive ? "active" : ""
              }`}
              style={isCreateBoard && !isActive ? { color: "#2463EB" } : {}}
            >
              <Icon
                className="mr-2 h-5 w-5 flex-shrink-0"
                style={isCreateBoard && !isActive ? { color: "#2463EB" } : {}}
              />
              <span className="text-sm py-2">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Folders Section */}
      <div className="flex-1 px-3 border-t border-[var(--sidebar-border-color)] pt-3">
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-[var(--sidebar-text-secondary)] uppercase tracking-wider px-2">
            Folders
          </h3>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {folders.map((folder: SidebarFolder) => {
            const isExpanded = expandedFolders.includes(folder.id);
            const FolderIcon = isExpanded ? FolderOpen : FolderClosed;

            return (
              <div key={folder.id}>
                {/* Folder Header */}
                <div className="w-full flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-[var(--sidebar-hover-bg)] transition-colors">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="flex items-center flex-1 text-left"
                  >
                    <FolderIcon className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 truncate">{folder.name}</span>
                  </button>
                  <button
                    onClick={e => createNewBoard(folder.id, e)}
                    className="p-1 rounded hover:bg-[var(--sidebar-active-bg)] transition-colors"
                    title="Create new board"
                  >
                    <PlusCircle className="h-4 w-4 flex-shrink-0" />
                  </button>
                </div>

                {/* Boards List */}
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {folder.boards.map((board: SidebarBoard) => {
                      const isBoardActive = pathname === board.href;

                      return (
                        <Link
                          key={board.id}
                          href={board.href}
                          className={`sidebar-nav-item flex items-center px-2 py-1 rounded-md text-sm ${
                            isBoardActive ? "active" : ""
                          }`}
                        >
                          <Clipboard className="mr-2 h-5 w-5 flex-shrink-0 opacity-60" />
                          <span className="truncate">{board.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-3 pb-3 space-y-3">
        {/* Settings Navigation */}
        <nav className="space-y-1">
          {bottomNavigation.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-nav-item flex px-2 items-center rounded-md text-sm font-medium ${
                  isActive ? "active" : ""
                }`}
              >
                <Icon className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-sm py-2">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Profile Section */}
      <div className="border-t border-[var(--sidebar-border-color)] p-3 pt-1.5">
        <div className="flex items-center px-2 py-2 rounded-md hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          <div className="ml-2 flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--sidebar-text-primary)] truncate">
              {user?.firstName || user?.username || "User"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
