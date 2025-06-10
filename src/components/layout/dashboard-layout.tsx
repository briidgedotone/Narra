import { ReactNode } from "react";

import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1">
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="container-narra py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
