"use client";

import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  updateFolder,
  deleteFolder,
  updateBoard,
  deleteBoard,
} from "@/app/actions/folders";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Search,
  Bookmark,
  Users,
  Settings,
  Clipboard,
  Folder,
  PlusCircle,
  ChevronDown,
  ChevronUp,
} from "@/components/ui/icons";
import { LoadingSpinner } from "@/components/ui/loading";
import { useFolders } from "@/hooks/useFolders";

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Discovery", href: "/discovery", icon: Search },
  { name: "Saved Posts", href: "/saved", icon: Bookmark },
  { name: "Following", href: "/following", icon: Users },
  {
    name: "Create Folder",
    href: "#",
    icon: Folder,
    special: true,
    onClick: true,
  },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { folders, isLoading, createNewBoard, createNewFolder, loadFolders } =
    useFolders();

  // Initialize expanded folders from localStorage
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Inline editing states
  const [editingItem, setEditingItem] = useState<{
    type: "folder" | "board";
    id: string;
    name: string;
  } | null>(null);

  // Set client-side flag after hydration
  useEffect(() => {
    setIsClient(true);

    // Load from localStorage only on client
    const savedExpanded = localStorage.getItem("narra-expanded-folders");
    if (savedExpanded) {
      try {
        setExpandedFolders(JSON.parse(savedExpanded));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Persist expanded folders to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(
        "narra-expanded-folders",
        JSON.stringify(expandedFolders)
      );
    }
  }, [expandedFolders, isClient]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleCreateNewBoard = async (
    folderId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent folder toggle when clicking plus

    const newBoard = await createNewBoard(folderId);
    if (newBoard) {
      // Expand the folder if it's not already expanded
      if (!expandedFolders.includes(folderId)) {
        setExpandedFolders(prev => [...prev, folderId]);
      }

      // Navigate to the new board
      router.push(`/boards/${newBoard.id}`);
    }
  };

  const handleCreateNewFolder = async (event: React.MouseEvent) => {
    event.preventDefault();

    const newFolder = await createNewFolder();
    if (newFolder) {
      // Expand the new folder
      setExpandedFolders(prev => [...prev, newFolder.id]);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setEditingItem({
        type: "folder",
        id: folderId,
        name: folder.name,
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${folder.name}"? This will also delete all boards inside this folder. This action cannot be undone.`
    );

    if (confirmed) {
      try {
        const result = await deleteFolder(folderId);
        if (result.success) {
          toast.success("Folder deleted successfully");
          await loadFolders();
        } else {
          toast.error(result.error || "Failed to delete folder");
        }
      } catch (error) {
        console.error("Error deleting folder:", error);
        toast.error("Failed to delete folder");
      }
    }
  };

  const handleRenameBoard = (boardId: string) => {
    // Find the board in folders
    let boardName = "";
    for (const folder of folders) {
      const board = folder.boards?.find(b => b.id === boardId);
      if (board) {
        boardName = board.name;
        break;
      }
    }

    if (boardName) {
      setEditingItem({
        type: "board",
        id: boardId,
        name: boardName,
      });
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    // Find the board name
    let boardName = "";
    for (const folder of folders) {
      const board = folder.boards?.find(b => b.id === boardId);
      if (board) {
        boardName = board.name;
        break;
      }
    }

    if (!boardName) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${boardName}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        const result = await deleteBoard(boardId);
        if (result.success) {
          toast.success("Board deleted successfully");
          await loadFolders();
        } else {
          toast.error(result.error || "Failed to delete board");
        }
      } catch (error) {
        console.error("Error deleting board:", error);
        toast.error("Failed to delete board");
      }
    }
  };

  const handleRenameSubmit = async (newName: string) => {
    if (
      !editingItem ||
      !newName.trim() ||
      newName.trim() === editingItem.name
    ) {
      setEditingItem(null);
      return;
    }

    try {
      if (editingItem.type === "folder") {
        const result = await updateFolder(editingItem.id, {
          name: newName.trim(),
        });
        if (result.success) {
          toast.success("Folder renamed successfully");
          await loadFolders();
        } else {
          toast.error(result.error || "Failed to rename folder");
        }
      } else {
        const result = await updateBoard(editingItem.id, {
          name: newName.trim(),
        });
        if (result.success) {
          toast.success("Board renamed successfully");
          await loadFolders();
        } else {
          toast.error(result.error || "Failed to rename board");
        }
      }
    } catch (error) {
      console.error("Error renaming:", error);
      toast.error(`Failed to rename ${editingItem.type}`);
    } finally {
      setEditingItem(null);
    }
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
          const isCreateFolder = item.special;

          if (item.onClick) {
            return (
              <button
                key={item.name}
                onClick={handleCreateNewFolder}
                className={`sidebar-nav-item flex px-2 items-center rounded-md text-sm font-medium w-full text-left`}
                style={isCreateFolder && !isActive ? { color: "#2463EB" } : {}}
              >
                <Icon
                  className="mr-2 h-5 w-5 flex-shrink-0"
                  style={
                    isCreateFolder && !isActive ? { color: "#2463EB" } : {}
                  }
                />
                <span className="text-sm py-2">{item.name}</span>
              </button>
            );
          }

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

      {/* Folders Section */}
      <div className="flex-1 px-3 border-t border-[var(--sidebar-border-color)] pt-3 flex flex-col min-h-0">
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-[var(--sidebar-text-secondary)] uppercase tracking-wider px-2">
            Folders
          </h3>
        </div>
        <div className="space-y-1 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="px-2 py-4 text-center">
              <LoadingSpinner />
            </div>
          ) : folders.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-[var(--sidebar-text-secondary)]">
              No folders yet
            </div>
          ) : (
            folders.map(folder => {
              const isExpanded = expandedFolders.includes(folder.id);

              return (
                <div key={folder.id}>
                  {/* Folder Header */}
                  <div className="group w-full flex items-center px-2 py-1.5 rounded-md text-sm font-medium hover:bg-[var(--sidebar-hover-bg)] transition-colors">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="flex items-center flex-1 text-left"
                    >
                      <Folder className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span
                        className={`flex-1 truncate ${editingItem?.type === "folder" && editingItem.id === folder.id ? "bg-blue-50 px-1 py-0.5 rounded outline-none" : ""}`}
                        contentEditable={
                          editingItem?.type === "folder" &&
                          editingItem.id === folder.id
                        }
                        suppressContentEditableWarning={true}
                        onKeyDown={e => {
                          if (
                            editingItem?.type === "folder" &&
                            editingItem.id === folder.id
                          ) {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const text = e.currentTarget.textContent || "";
                              handleRenameSubmit(text);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              setEditingItem(null);
                              e.currentTarget.textContent = folder.name;
                            }
                          }
                        }}
                        onBlur={e => {
                          if (
                            editingItem?.type === "folder" &&
                            editingItem.id === folder.id
                          ) {
                            const text = e.currentTarget.textContent || "";
                            handleRenameSubmit(text);
                          }
                        }}
                        ref={el => {
                          if (
                            editingItem?.type === "folder" &&
                            editingItem.id === folder.id &&
                            el
                          ) {
                            el.focus();
                            // Select all text
                            const range = document.createRange();
                            range.selectNodeContents(el);
                            const selection = window.getSelection();
                            selection?.removeAllRanges();
                            selection?.addRange(range);
                          }
                        }}
                      >
                        {folder.name}
                      </span>
                      {isClient && (
                        <span className="ml-3 relative">
                          {/* Default chevron icons */}
                          <span className="group-hover:opacity-0 transition-opacity duration-200">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </span>
                          {/* Three dots icon on hover */}
                          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-1 rounded hover:bg-[var(--sidebar-active-bg)] transition-colors cursor-pointer"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleRenameFolder(folder.id)}
                                >
                                  Rename Folder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteFolder(folder.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  Delete Folder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </span>
                        </span>
                      )}
                    </button>
                    <button
                      onClick={e => handleCreateNewBoard(folder.id, e)}
                      className="ml-1 p-1 rounded hover:bg-[var(--sidebar-active-bg)] transition-colors"
                      title="Create new board"
                    >
                      <PlusCircle className="h-4 w-4 flex-shrink-0" />
                    </button>
                  </div>

                  {/* Boards List */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {folder.boards?.map(board => {
                        const isBoardActive =
                          pathname === `/boards/${board.id}`;

                        return (
                          <div
                            key={board.id}
                            className={`group sidebar-nav-item flex items-center px-2 py-1 rounded-md text-sm hover:bg-[var(--sidebar-hover-bg)] transition-colors ${
                              isBoardActive ? "active" : ""
                            }`}
                          >
                            {editingItem?.type === "board" &&
                            editingItem.id === board.id ? (
                              <div className="flex items-center flex-1">
                                <Clipboard className="mr-2 h-5 w-5 flex-shrink-0 opacity-60" />
                                <span
                                  className="flex-1 truncate bg-blue-50 px-1 py-0.5 rounded outline-none"
                                  contentEditable={true}
                                  suppressContentEditableWarning={true}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const text =
                                        e.currentTarget.textContent || "";
                                      handleRenameSubmit(text);
                                    } else if (e.key === "Escape") {
                                      e.preventDefault();
                                      setEditingItem(null);
                                      e.currentTarget.textContent = board.name;
                                    }
                                  }}
                                  onBlur={e => {
                                    const text =
                                      e.currentTarget.textContent || "";
                                    handleRenameSubmit(text);
                                  }}
                                  ref={el => {
                                    if (el) {
                                      el.focus();
                                      // Select all text
                                      const range = document.createRange();
                                      range.selectNodeContents(el);
                                      const selection = window.getSelection();
                                      selection?.removeAllRanges();
                                      selection?.addRange(range);
                                    }
                                  }}
                                >
                                  {board.name}
                                </span>
                              </div>
                            ) : (
                              <Link
                                href={`/boards/${board.id}`}
                                className="flex items-center flex-1"
                              >
                                <Clipboard className="mr-2 h-5 w-5 flex-shrink-0 opacity-60" />
                                <span className="flex-1 truncate">
                                  {board.name}
                                </span>
                              </Link>
                            )}
                            {isClient && (
                              <span className="ml-3 relative opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="p-1 rounded hover:bg-[var(--sidebar-active-bg)] transition-colors cursor-pointer"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                  >
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleRenameBoard(board.id)
                                      }
                                    >
                                      Rename Board
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteBoard(board.id)
                                      }
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      Delete Board
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
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
