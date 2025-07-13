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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Shield,
  Clipboard,
  // Folder, // Not currently used
  FolderClosed,
  FolderOpen,
  PlusCircle,
  ChevronDown,
  ChevronUp,
} from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/hooks/useAdmin";
import { useFolders } from "@/hooks/useFolders";
import { preloadRoute } from "@/lib/utils/preload";

import { SidebarSkeleton } from "./sidebar-skeleton";

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Discovery", href: "/discovery", icon: Search },
  { name: "Saved Posts", href: "/saved", icon: Bookmark },
  { name: "Following", href: "/following", icon: Users },
  {
    name: "Create Folder",
    href: "#",
    icon: PlusCircle,
    special: true,
    onClick: true,
  },
];

const adminNavigation = [{ name: "Admin", href: "/admin", icon: Shield }];

const bottomNavigation = [
  { name: "Usage & Billing", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { isAdmin } = useAdmin();
  const {
    folders,
    isLoading,
    createNewBoard,
    createNewFolder,
    refreshFolders,
  } = useFolders();

  // Initialize expanded folders from localStorage
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Dialog states
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    type: "folder" | "board";
    id: string;
    currentName: string;
    isCreating: boolean;
  }>({
    open: false,
    type: "folder",
    id: "",
    currentName: "",
    isCreating: false,
  });
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "folder" | "board";
    id: string;
    name: string;
  }>({ open: false, type: "folder", id: "", name: "" });
  const [isDeleting, setIsDeleting] = useState(false);

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

      // Immediately open rename dialog for the new board
      setRenameDialog({
        open: true,
        type: "board",
        id: newBoard.id,
        currentName: newBoard.name,
        isCreating: true,
      });
      setNewName(newBoard.name);
    }
  };

  const handleCreateNewFolder = async (event: React.MouseEvent) => {
    event.preventDefault();

    const newFolder = await createNewFolder();
    if (newFolder) {
      // Expand the new folder
      setExpandedFolders(prev => [...prev, newFolder.id]);

      // Immediately open rename dialog for the new folder
      setRenameDialog({
        open: true,
        type: "folder",
        id: newFolder.id,
        currentName: newFolder.name,
        isCreating: true,
      });
      setNewName(newFolder.name);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setRenameDialog({
        open: true,
        type: "folder",
        id: folderId,
        currentName: folder.name,
        isCreating: false,
      });
      setNewName(folder.name);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    setDeleteDialog({
      open: true,
      type: "folder",
      id: folderId,
      name: folder.name,
    });
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
      setRenameDialog({
        open: true,
        type: "board",
        id: boardId,
        currentName: boardName,
        isCreating: false,
      });
      setNewName(boardName);
    }
  };

  const handleDeleteBoard = (boardId: string) => {
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

    setDeleteDialog({
      open: true,
      type: "board",
      id: boardId,
      name: boardName,
    });
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (deleteDialog.type === "folder") {
        const result = await deleteFolder(deleteDialog.id);
        if (result.success) {
          toast.success("Folder deleted successfully");
          await refreshFolders();
        } else {
          toast.error(result.error || "Failed to delete folder");
        }
      } else {
        const result = await deleteBoard(deleteDialog.id);
        if (result.success) {
          toast.success("Board deleted successfully");
          await refreshFolders();
        } else {
          toast.error(result.error || "Failed to delete board");
        }
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(`Failed to delete ${deleteDialog.type}`);
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, type: "folder", id: "", name: "" });
    }
  };

  const handleRenameSubmit = async () => {
    if (!newName.trim() || newName.trim() === renameDialog.currentName) {
      setRenameDialog({
        open: false,
        type: "folder",
        id: "",
        currentName: "",
        isCreating: false,
      });
      setNewName("");
      return;
    }

    setIsRenaming(true);
    const isNewlyCreated =
      renameDialog.currentName.startsWith("Untitled Board") ||
      renameDialog.currentName.startsWith("New Folder");

    try {
      if (renameDialog.type === "folder") {
        const result = await updateFolder(renameDialog.id, {
          name: newName.trim(),
        });
        if (result.success) {
          toast.success("Folder renamed successfully");
          await refreshFolders();
        } else {
          toast.error(result.error || "Failed to rename folder");
        }
      } else {
        const result = await updateBoard(renameDialog.id, {
          name: newName.trim(),
        });
        if (result.success) {
          toast.success("Board renamed successfully");
          await refreshFolders();

          // Navigate to board if it was newly created
          if (isNewlyCreated) {
            router.push(`/boards/${renameDialog.id}`);
          }
        } else {
          toast.error(result.error || "Failed to rename board");
        }
      }
    } catch (error) {
      console.error("Error renaming:", error);
      toast.error(`Failed to rename ${renameDialog.type}`);
    } finally {
      setIsRenaming(false);
      setRenameDialog({
        open: false,
        type: "folder",
        id: "",
        currentName: "",
        isCreating: false,
      });
      setNewName("");
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
                className={`sidebar-nav-item flex px-2 items-center rounded-md text-sm font-medium w-full text-left cursor-pointer`}
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
              onMouseEnter={() => preloadRoute(item.href)}
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
            <SidebarSkeleton />
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
                    <div
                      onClick={() => toggleFolder(folder.id)}
                      className="flex items-center flex-1 text-left cursor-pointer"
                    >
                      {isExpanded ? (
                        <FolderOpen className="mr-2 h-5 w-5 flex-shrink-0" />
                      ) : (
                        <FolderClosed className="mr-2 h-5 w-5 flex-shrink-0" />
                      )}
                      <span className="flex-1 truncate">{folder.name}</span>
                      {isClient && (
                        <span className="ml-3 relative w-4 h-4 flex items-center justify-center">
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
                    </div>
                    <button
                      onClick={e => handleCreateNewBoard(folder.id, e)}
                      className="ml-1 p-1 rounded hover:bg-[var(--sidebar-active-bg)] transition-colors cursor-pointer"
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
                            <Link
                              href={`/boards/${board.id}`}
                              className="flex items-center flex-1"
                              onMouseEnter={() => preloadRoute("/boards")}
                            >
                              <Clipboard className="mr-2 h-5 w-5 flex-shrink-0 opacity-60" />
                              <span className="flex-1 truncate">
                                {board.name}
                              </span>
                            </Link>
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
        {/* Admin Navigation */}
        {isAdmin && (
          <nav className="space-y-1 border-t border-[var(--sidebar-border-color)] pt-3">
            {adminNavigation.map(item => {
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
        )}

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

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onOpenChange={open => {
          if (!open) {
            setRenameDialog({
              open: false,
              type: "folder",
              id: "",
              currentName: "",
              isCreating: false,
            });
            setNewName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {renameDialog.isCreating
                ? `Create New ${renameDialog.type === "folder" ? "Folder" : "Board"}`
                : `Rename ${renameDialog.type === "folder" ? "Folder" : "Board"}`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {renameDialog.type === "folder" ? "Folder" : "Board"} Name
              </label>
              <Input
                id="name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={`Enter ${renameDialog.type} name`}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleRenameSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialog({
                  open: false,
                  type: "folder",
                  id: "",
                  currentName: "",
                  isCreating: false,
                });
                setNewName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={
                isRenaming ||
                !newName.trim() ||
                newName.trim() === renameDialog.currentName
              }
            >
              {isRenaming
                ? renameDialog.isCreating
                  ? "Creating..."
                  : "Renaming..."
                : renameDialog.isCreating
                  ? "Create"
                  : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={open => {
          if (!open) {
            setDeleteDialog({ open: false, type: "folder", id: "", name: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Delete {deleteDialog.type === "folder" ? "Folder" : "Board"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                &quot;{deleteDialog.name}&quot;
              </span>
              ?
            </p>
            {deleteDialog.type === "folder" && (
              <p className="text-sm text-red-600 mb-4">
                ⚠️ This will also delete all boards inside this folder.
              </p>
            )}
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialog({
                  open: false,
                  type: "folder",
                  id: "",
                  name: "",
                });
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
