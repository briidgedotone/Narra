import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle } from "@/components/ui/icons";
import { supabase } from "@/lib/supabase";

// Function to fetch real admin stats
async function getAdminStats() {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_sign_in_at", thirtyDaysAgo.toISOString());

    // Get total boards count (collections)
    const { count: totalCollections } = await supabase
      .from("boards")
      .select("*", { count: "exact", head: true });

    // Get total posts count
    const { count: totalPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalCollections: totalCollections || 0,
      totalPosts: totalPosts || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalCollections: 0,
      totalPosts: 0,
    };
  }
}

// Format number with commas
function formatNumber(num: number): string {
  return num.toLocaleString();
}

export async function OverviewTab() {
  const stats = await getAdminStats();
  const activeUserPercentage =
    stats.totalUsers > 0
      ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
      : "0.0";

  // Empty state collections for admin
  const emptyCollections = [
    {
      title: "Featured Collection 1",
      description: "Select a board to feature as your first collection",
      backgroundColor: "#FDA02C",
    },
    {
      title: "Featured Collection 2",
      description: "Select a board to feature as your second collection",
      backgroundColor: "#E87BD1",
    },
    {
      title: "Featured Collection 3",
      description: "Select a board to feature as your third collection",
      backgroundColor: "#EE97DB",
    },
    {
      title: "Featured Collection 4",
      description: "Select a board to feature as your fourth collection",
      backgroundColor: "#B078F9",
    },
  ];

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
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalUsers)}
            </div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.activeUsers)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeUserPercentage}% of total users
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
              {formatNumber(stats.totalCollections)}
            </div>
            <p className="text-xs text-muted-foreground">Created boards</p>
          </CardContent>
        </Card>

        {/* Total Posts */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalPosts)}
            </div>
            <p className="text-xs text-muted-foreground">Saved posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Collections */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Collections</h2>
        <div className="inline-grid grid-cols-2 gap-y-4 gap-x-6">
          {emptyCollections.map((collection, index) => (
            <div
              key={index}
              className="w-[488px] h-[152px] p-4 bg-[#F8F8F8] border-none rounded-xl overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex h-full">
                <div
                  className="w-[120px] h-[120px] flex-shrink-0 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: collection.backgroundColor }}
                >
                  <PlusCircle className="h-8 w-8 text-white" />
                </div>
                <div className="pl-4 flex-1 flex flex-col justify-start py-2">
                  <h3 className="text-sm font-semibold mb-2">
                    {collection.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    {collection.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        +
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Click to select board
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
