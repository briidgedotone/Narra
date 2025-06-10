import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  loading?: boolean;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  loading = false,
}: StatsCardProps) {
  return (
    <Card className="p-6">
      <CardContent className="flex items-center space-x-4 p-0">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">
            {loading ? "..." : value.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
