"use client";

import { Menu } from "lucide-react";
import { ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";

import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full z-50">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Menu Button */}
          <div className="md:hidden p-4 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2"
            >
              <Menu className="h-4 w-4" />
              <span className="text-lg font-semibold text-primary">
                Use Narra
              </span>
            </Button>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="container-narra py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
