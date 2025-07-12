import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  loading = false,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
