"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Home, Search, Bookmark, Users, Settings } from "@/components/ui/icons";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Discovery", href: "/discovery", icon: Search },
  { name: "Saved Posts", href: "/saved", icon: Bookmark },
  { name: "Following", href: "/following", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sidebar-narra h-full flex flex-col">
      {/* Brand Header */}
      <div className="p-6 border-b border-[var(--sidebar-border-color)]">
        <h2 className="sidebar-brand text-lg font-semibold">Use Narra</h2>
        <p className="text-xs text-[var(--sidebar-text-secondary)] mt-1">
          Content Curation Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-nav-item flex items-center px-3 py-3 rounded-lg text-sm font-medium ${
                isActive ? "active" : ""
              }`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--sidebar-border-color)]">
        <div className="text-xs text-[var(--sidebar-text-secondary)] text-center">
          <p>© 2024 Use Narra</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
