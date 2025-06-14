"use client";

import { ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Menu, X } from "@/components/ui/icons";

import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export function DashboardLayout({ children, header }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block fixed left-0 top-0 h-full z-30">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Mobile Sidebar */}
            <div className="fixed left-0 top-0 h-full z-50 md:hidden">
              <div className="relative h-full">
                <Sidebar />
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 md:ml-[var(--sidebar-width)]">
          {/* Mobile Menu Button */}
          <div className="md:hidden p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-2"
              >
                <Menu className="h-4 w-4" />
                <span className="sidebar-brand text-lg font-semibold">
                  Use Narra
                </span>
              </Button>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {header}
            <div className={header ? "" : "p-6"}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
