"use client";

import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Home, Search, Bookmark, Users, Settings } from "@/components/ui/icons";

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Discovery", href: "/discovery", icon: Search },
  { name: "Saved Posts", href: "/saved", icon: Bookmark },
  { name: "Following", href: "/following", icon: Users },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

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
      <nav className="flex-1 px-3 py-3 space-y-1">
        {mainNavigation.map(item => {
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
              <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="text-sm py-2">{item.name}</span>
            </Link>
          );
        })}
      </nav>

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
                <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
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
