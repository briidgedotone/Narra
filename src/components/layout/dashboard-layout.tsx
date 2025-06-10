import { ReactNode } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header title={title} />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="container-narra py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
