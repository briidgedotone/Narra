"use client";

import { OverviewTab } from "@/components/admin/overview-tab";
import { UsersTab } from "@/components/admin/users-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminContent() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-base font-semibold text-[#171717]">
          Admin Dashboard
        </h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
