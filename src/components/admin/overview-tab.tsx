import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "@/components/ui/icons";

// Mock data for overview
const mockStats = {
  totalUsers: "5,234",
  activeUsers: "3,147",
  totalCollections: "847",
  totalPosts: "24,556",
};

const mockRecentActivity = [
  {
    id: "1",
    type: "user_signup",
    description: "New user registered: Sarah Chen",
    time: "5 minutes ago",
  },
  {
    id: "2",
    type: "collection_created",
    description: "New collection created: Marketing Trends 2024",
    time: "15 minutes ago",
  },
  {
    id: "3",
    type: "post_saved",
    description: "25 posts added to 'Social Media Strategy' collection",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "user_upgrade",
    description: "User upgraded to Growth plan: Alex Johnson",
    time: "2 hours ago",
  },
  {
    id: "5",
    type: "collection_shared",
    description: "Collection 'Content Ideas' shared with team",
    time: "3 hours ago",
  },
];

export function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              60.1% of total users
            </p>
          </CardContent>
        </Card>

        {/* Total Collections */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collections
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.totalCollections}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>

        {/* Total Posts */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              +5.7% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions and events across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map(activity => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <Badge variant="outline" className="shadow-none">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks and actions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" className="shadow-none">
            Export Analytics
          </Button>
          <Button variant="outline" className="shadow-none">
            Manage Users
          </Button>
          <Button variant="outline" className="shadow-none">
            System Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
